import { encodeAccount, encodeOperator, encodeUser } from "@nats-io/jwt";
import { createAccount, createOperator, createUser } from "@nats-io/nkeys";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const unlimitedAccount = {
  limits: {
    subs: -1,
    data: -1,
    payload: -1,
    imports: -1,
    exports: -1,
    wildcards: true,
    conn: -1,
    leaf: -1,
    mem_storage: -1,
    disk_storage: -1,
    streams: -1,
    consumer: -1,
    max_ack_pending: -1
  }
};

const operator = createOperator();
const systemAccount = createAccount();
const chatAccount = createAccount();
const backendUser = createUser();

const operatorJwt = await encodeOperator("chat", operator, {
  system_account: systemAccount.getPublicKey()
});
const systemJwt = await encodeAccount(
  "SYS",
  systemAccount,
  {},
  { signer: operator }
);
const chatJwt = await encodeAccount("CHAT", chatAccount, unlimitedAccount, {
  signer: operator
});
const backendJwt = await encodeUser(
  "chat-backend",
  backendUser,
  chatAccount,
  {}
);

const natsConfig = `
port: 4222
http_port: 8222
operator: ${operatorJwt}
system_account: ${systemAccount.getPublicKey()}
resolver: MEMORY
resolver_preload: {
  ${systemAccount.getPublicKey()}: ${systemJwt}
  ${chatAccount.getPublicKey()}: ${chatJwt}
}
websocket {
  port: 8080
  no_tls: true
}
jetstream {
  store_dir: "/data"
}
`.trim();

const outputDir = resolve(import.meta.dirname, "../../infra/nats");
mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, "nats.conf"), natsConfig);

const seedOf = (key) => new TextDecoder().decode(key.getSeed());

console.log(`NATS_USER_JWT=${backendJwt}`);
console.log(`NATS_USER_SEED=${seedOf(backendUser)}`);
console.log(`NATS_ACCOUNT_SEED=${seedOf(chatAccount)}`);
