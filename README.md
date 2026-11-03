# Chat

Chat em tempo real entre duas pessoas. Os usuários se cadastram, entram e conversam com qualquer outro usuário. A lista de contatos mostra quem está online e quantas mensagens não foram lidas.

- **Backend:** NestJS, MongoDB, Redis e NATS com JetStream
- **Frontend:** React, Vite e TypeScript
- **Testes e lint:** Vitest e Biome nos dois projetos

Detalhes de cada projeto: [backend](backend/README.md) e [frontend](frontend/README.md).

## Como rodar

Você precisa do Node.js 24.9 ou mais novo e do Docker.

1. Em `backend` e depois em `frontend`, instale as dependências e crie o arquivo de ambiente:

   ```bash
   npm ci
   cp .env.example .env
   ```

2. Em `backend`, gere a configuração do NATS e cole as três linhas impressas no `backend/.env`. Rode só uma vez, porque cada execução cria chaves novas:

   ```bash
   node scripts/generate-nats-config.ts
   ```

3. Defina um valor longo e aleatório para `SESSION_SECRET` no `backend/.env`.

4. Na raiz do repositório, suba o MongoDB, o Redis e o NATS:

   ```bash
   docker compose -f compose-dev.yml up -d
   ```

5. Em `backend`, inicie a API:

   ```bash
   npm run start:dev
   ```

6. Em `frontend`, inicie o app:

   ```bash
   npm run dev
   ```

7. Abra `http://localhost:5173` e cadastre dois usuários, um em uma janela normal e outro em uma janela anônima.

## Build e testes

Em `backend`:

```bash
npm run lint
npm run type-check
npm test
npm run build
```

Em `frontend`:

```bash
npm run lint
npm test
npm run build
```

## Modo cluster

Em `backend`, rode vários processos na mesma porta. `WEB_CONCURRENCY` define quantos; sem ela, é um por núcleo da CPU:

```bash
npm run build
npm run start:cluster
```

## Como funciona

```
                    HTTP + cookie de sessão
  Navegador  --------------------------->  Backend NestJS  --->  MongoDB
  (React)                                      |    |
     ^                                         |    +--------->  Redis (sessões)
     |  WebSocket, só assinatura               |
     +------------------  NATS  <--------------+
```

- **O navegador envia por HTTP e só escuta pelo NATS.** Quem envia a mensagem sempre vem da sessão, e a credencial do NATS no navegador não pode publicar.
- **A mensagem é salva antes de ser publicada.** O MongoDB é a fonte da verdade. Ao reconectar, o navegador busca os dados de novo por HTTP.
- **O JetStream distribui as mensagens.** Os processos do backend dividem um único consumidor, então cada evento é tratado por um deles, que avisa os dois participantes.
- **As sessões ficam no Redis.** Assim, um login feito em um processo vale para todos.
- **O status online usa heartbeat.** O navegador avisa a cada 20 segundos, e quem para de avisar fica offline depois de cerca de um minuto.

## Problemas e soluções

- **Assinar credenciais do NATS:** o `@nestjs/jwt` não gera as assinaturas `ed25519-nkey` que o NATS exige, então as credenciais usam `@nats-io/jwt` e `@nats-io/nkeys`.
- **Novas tentativas no JetStream:** um `nak` simples reenvia na hora, mesmo com `backoff` configurado. O consumidor passa um atraso explícito em cada `nak`, o que dá tempo para uma falha temporária passar.
- **Eventos perdidos:** o NATS core não repete o que foi perdido durante uma desconexão, por isso os dados são buscados de novo ao reconectar.
- **Conexões duplicadas:** o StrictMode do React roda os efeitos duas vezes em desenvolvimento. Uma conexão que termina de abrir depois da limpeza do efeito se fecha sozinha.
- **Mensagens repetidas:** a mesma mensagem pode chegar pela resposta HTTP e pelo evento, e o JetStream pode reenviá-la. O frontend ignora um ID que já conhece.
- **Respostas atrasadas:** ao trocar de contato rápido, o histórico antigo pode chegar depois do novo. O efeito ignora o resultado depois da limpeza.
- **Testes instáveis:** subir um MongoDB por arquivo de teste causava falhas por tempo esgotado. Agora há um único servidor por execução, com um banco separado para cada arquivo.

## Deploy

- Use `wss://` no `NATS_WS_URL` e sirva a API por HTTPS.
- Configure `SESSION_SECRET`, `FRONTEND_ORIGIN` e `VITE_API_URL` com os valores reais.
- Guarde as chaves do NATS como segredos e use um resolver persistente, para as credenciais sobreviverem a um reinício.
- Mantenha o MongoDB e o Redis fora de redes públicas e com autenticação.
- Rode o backend em modo cluster ou com um gerenciador de processos.
