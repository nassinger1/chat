# Frontend

Interface do chat, feita com React e Vite. As mensagens são enviadas por HTTP para o backend, e as atualizações em tempo real chegam pelo NATS.

## Como rodar

Você precisa do Node.js 24.9 ou mais novo e do [backend](../backend/README.md) rodando.

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Crie o arquivo de ambiente. O valor padrão de `VITE_API_URL` já aponta para o backend local:

   ```bash
   cp .env.example .env
   ```

3. Inicie o app:

   ```bash
   npm run dev
   ```

4. Abra `http://localhost:5173`. Use `localhost` em vez de `127.0.0.1`, para o cookie de sessão funcionar.

Para testar a conversa, cadastre dois usuários: um em uma janela normal e outro em uma janela anônima.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia o app em modo de desenvolvimento |
| `npm test` | Roda os testes |
| `npm run lint` | Verifica o lint e a formatação |
| `npm run build` | Verifica os tipos e gera o build em `dist` |

## Como o código é organizado

| Pasta em `src` | Conteúdo |
| --- | --- |
| `pages` | Telas de login, cadastro e mensagens |
| `components` | Componentes visuais reutilizáveis |
| `contexts` | Sessão do usuário e conexão em tempo real |
| `services` | Chamadas à API e cliente do NATS |
