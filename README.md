# Chat

A real-time one-to-one chat. Users register, log in, pick any other registered user and exchange messages that appear on the recipient's screen right away. The contact list shows who is online, and unread messages show up as a badge on the contact and in the browser tab title.

- Backend: NestJS, MongoDB, Redis (sessions), NATS with JetStream
- Frontend: React, Vite, TypeScript
- Tests: Vitest in both projects. Lint and format: Biome in both projects

## Prerequisites

- Node.js 24.9 or newer (the NATS config script runs as a TypeScript file with `node`)
- Docker with Docker Compose

## Repository layout

| Folder | Contents |
| --- | --- |
| `backend` | NestJS API and the NATS publisher/consumer code |
| `frontend` | React app |
| `infra/nats` | NATS server config. `nats.conf` is generated locally and is not committed |
| `compose-dev.yml` | MongoDB, Redis and NATS for local development |

## Running it locally

1. Install dependencies. From `backend`, then from `frontend`:

   ```bash
   npm ci
   ```

2. Create the environment files. From `backend`, then from `frontend`:

   ```bash
   cp .env.example .env
   ```

   On PowerShell, use `Copy-Item .env.example .env`.

3. Generate the NATS configuration. From `backend`:

   ```bash
   node scripts/generate-nats-config.ts
   ```

   This writes `infra/nats/nats.conf` and prints three lines (`NATS_USER_JWT`, `NATS_USER_SEED`, `NATS_ACCOUNT_SEED`). Paste them into `backend/.env`. Running the script again creates new keys and replaces `nats.conf`, so run it once per environment.

4. Set `SESSION_SECRET` in `backend/.env` to a long random value.

5. Start MongoDB, Redis and NATS. From the repository root:

   ```bash
   docker compose -f compose-dev.yml up -d
   ```

6. Start the backend. From `backend`:

   ```bash
   npm run start:dev
   ```

7. Start the frontend. From `frontend`:

   ```bash
   npm run dev
   ```

8. Open `http://localhost:5173`. Use `localhost`, not `127.0.0.1`, so the session cookie matches the configured origin. To try the chat, register two users, one in a normal window and one in a private window.

Useful local addresses: the API on `http://localhost:3000`, NATS monitoring on `http://localhost:8222` (for example `/connz` lists connections), and NATS over WebSocket on `ws://localhost:8080`.

## Tests and checks

From `backend`:

```bash
npm run lint
npm run type-check
npm test
```

From `frontend`:

```bash
npm run lint
npm test
npm run build
```

The backend repository tests use `mongodb-memory-server`, which downloads a MongoDB binary the first time they run. `backend/.env.test` holds the settings for the test run.

To print the events a user receives from NATS, get that user's credentials from `POST /auth/broker-credentials` and run from `backend`:

```bash
node scripts/listen-events.ts <userId> <jwt> <seed>
```

## Running in cluster mode

`src/cluster.ts` starts one worker per CPU core, and each worker runs the normal application. All workers share port 3000. From `backend`:

```bash
npm run build
npm run start:cluster
```

Set `WEB_CONCURRENCY` to choose the number of workers. On PowerShell:

```powershell
$env:WEB_CONCURRENCY = 3
npm run start:cluster
```

With three workers, `http://localhost:8222/connz` lists three backend connections. If a worker exits, the primary process starts a new one.

## Architecture

```
                    HTTP + session cookie
  Browser  ----------------------------->  NestJS backend  --->  MongoDB
  (React)                                      |    |
     ^                                         |    +--------->  Redis (sessions)
     |  WebSocket, subscribe only              |
     +------------------  NATS  <--------------+
                     (JetStream + core)
```

Main decisions:

- **The browser sends over HTTP and only listens on NATS.** The identity of the sender always comes from the session. The NATS credential given to a browser can subscribe to its own subject and the broadcast subject, and cannot publish.
- **Save first, then publish.** A message is saved in MongoDB, then published to JetStream. MongoDB is the source of truth. After the browser connects or reconnects, it refetches data over HTTP, because core NATS does not replay events missed while disconnected.
- **JetStream for delivery to users.** Publishing a message creates a JetStream event. One durable consumer shared by all backend processes receives it, so each event is handled by one process. That process publishes the result to `chat.events.<userId>` for both participants.
- **Sessions in Redis.** Each process has its own memory, so a login stored in one process would be invisible to the others. Redis makes sessions shared, which is what allows several processes behind one port.
- **Short-lived NATS credentials.** `POST /auth/broker-credentials` returns a JWT and seed that expire. The frontend asks for new ones shortly before expiry, opens the new connection, then closes the old one.
- **Repository boundary.** Only repository classes talk to MongoDB, and only the `*-res.dto.ts` mappers shape what leaves the API.
- **Duplicate conversations are prevented by the database.** A unique `participantsKey` (the two sorted user IDs) means two users can only ever have one conversation, even if two requests race.

NATS subjects:

| Subject | Type | Used for |
| --- | --- | --- |
| `chat.events.<userId>` | Core | New messages and read updates for one user |
| `chat.events` | Core | New users and presence changes |
| `chat.service.messages.created` | JetStream | Fan-out of new messages |
| `chat.service.health.check` | Core request-reply | Health over NATS |

HTTP routes:

| Method and path | Auth | Purpose |
| --- | --- | --- |
| `POST /users` | Public | Register |
| `GET /users` | Session | List other users, paginated |
| `POST /auth/login` | Public | Log in |
| `POST /auth/logout` | Session | Log out |
| `GET /auth/session` | Public | Check the current session |
| `POST /auth/broker-credentials` | Session | Get NATS credentials |
| `GET /conversations` | Session | List my conversations |
| `POST /conversations` | Session | Open a conversation with a user |
| `GET /conversations/:id/messages` | Session | Message history |
| `POST /conversations/:id/messages` | Session | Send a message |
| `POST /conversations/:id/read` | Session | Mark as read |
| `POST /presence/heartbeat` | Session | Keep the user online |
| `GET /health/live`, `GET /health/ready` | Public | Health |

Presence works with a heartbeat. An open browser calls `POST /presence/heartbeat` every 20 seconds, and a user whose heartbeat stops is marked offline by a periodic sweep.

## Development notes

Problems found along the way and how they were solved.

- **`@nats-io/transport-ws` does not exist.** The package returns 404 on npm. `wsconnect` is exported by `@nats-io/nats-core`, so the frontend depends on that package only.
- **`@nestjs/jwt` cannot sign NATS credentials.** NATS user credentials need `ed25519-nkey` signatures, which `@nestjs/jwt` cannot produce. Login uses sessions, so nothing else needs it, and `@nats-io/jwt` with `@nats-io/nkeys` creates the NATS credentials instead. `@nats-io/jwt` is pre-1.0, so its version is pinned exactly.
- **Plain `nak` ignores `backoff`.** A `backoff` list on a JetStream consumer does not apply to `nak`, and a plain `nak` redelivers immediately. The handler uses `nak` with an explicit delay (about 1, 3, 8, 18 and 48 seconds after the first attempt, giving up after 6 deliveries), so a temporary failure such as MongoDB restarting has time to clear.
- **Sessions need Redis for multiple processes.** An in-memory session store belongs to one process, so a login made on one worker would not be known by the others. Redis holds the sessions for all of them.
- **Save before publishing.** If the event were published first and the save failed, users would see a message that does not exist. Saving first means a failed publish loses a notification at worst, and the next refetch shows the correct state.
- **Refetch after reconnect.** Core NATS does not replay missed events, so after a reconnect, or after swapping credentials, the contact list and the open chat are loaded again over HTTP.
- **React StrictMode runs effects twice in development.** Opening a NATS connection is asynchronous, so the first effect can be cleaned up before its connection finishes opening. The effect has an `isCancelled` flag, and a connection that opens after cleanup closes itself. Without it, development showed two connections per tab.
- **The same message can arrive twice.** It comes back from the HTTP response and from the NATS event, and JetStream can redeliver. The chat ignores a message ID it already has.
- **A slow answer must not replace a newer chat.** When switching contacts quickly, the history request for the first contact can finish after the second one was selected. The load effect ignores results after cleanup.
- **The Vite template ships tools this project does not use.** The scaffold includes `oxlint`. It was removed in favor of Biome so both projects share one lint and format setup.
- **Type checking the frontend.** The root `tsconfig.json` of a Vite project only references other configs and compiles nothing. Use `npx tsc -p tsconfig.app.json --noEmit`, or `npm run build`, which also covers it.

## Deployment notes

- Serve the NATS WebSocket over TLS and return a `wss://` URL in `NATS_WS_URL`. The local config uses `no_tls: true` for development only.
- Use a long random `SESSION_SECRET`, and serve the API over HTTPS so the session cookie can be marked secure.
- Set `FRONTEND_ORIGIN` to the real frontend origin and `VITE_API_URL` to the real API address.
- The local NATS config keeps accounts in a static file. A production setup needs a persistent resolver, so credentials survive a restart, and the operator and account keys must be stored as secrets, never committed.
- Keep MongoDB and Redis off public networks, and use authentication on both.
- Run the backend in cluster mode or behind a process manager, with `WEB_CONCURRENCY` set to the number of workers wanted.
