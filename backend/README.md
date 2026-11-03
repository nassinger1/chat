# Backend

API do chat, feita com NestJS. Cuida de cadastro, login, conversas, mensagens e status online. Usa MongoDB para os dados, Redis para as sessões e NATS para os eventos em tempo real.

## Como rodar

Você precisa do Node.js 24.9 ou mais novo e do Docker.

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Crie o arquivo de ambiente:

   ```bash
   cp .env.example .env
   ```

3. Gere a configuração do NATS e cole as três linhas impressas no `.env`:

   ```bash
   node scripts/generate-nats-config.ts
   ```

   Rode só uma vez por ambiente, porque cada execução cria chaves novas e substitui o `infra/nats/nats.conf`.

4. Defina um valor longo e aleatório para `SESSION_SECRET` no `.env`.

5. Na raiz do repositório, suba o MongoDB, o Redis e o NATS:

   ```bash
   docker compose -f compose-dev.yml up -d
   ```

6. Inicie a API, que fica em `http://localhost:3000`:

   ```bash
   npm run start:dev
   ```

## Comandos

| Comando                 | O que faz                                    |
| ----------------------- | -------------------------------------------- |
| `npm run start:dev`     | Inicia a API e reinicia ao salvar um arquivo |
| `npm test`              | Roda os testes                               |
| `npm run lint`          | Verifica o lint e a formatação               |
| `npm run type-check`    | Verifica os tipos                            |
| `npm run build`         | Gera o build em `dist`                       |
| `npm run start:cluster` | Roda o build em vários processos             |

No modo cluster, a variável `WEB_CONCURRENCY` define o número de processos. Sem ela, é um por núcleo da CPU.

## Como o código é organizado

Cada funcionalidade tem sua pasta em `src`, como `users`, `conversations`, `messages` e `presence`. Uma requisição passa por três camadas:

- **Controller:** recebe a entrada por HTTP ou NATS.
- **Handler:** executa um caso de uso.
- **Repository:** é a única camada que acessa o MongoDB.
