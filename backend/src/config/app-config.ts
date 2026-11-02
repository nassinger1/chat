export enum AppEnvironment {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
}

export type AppConfig = {
  appEnv: AppEnvironment;
  logLevel: string;
  port: number;
  frontendOrigin: string;
  sessionSecret: string;
  mongoConn: string;
  redis: {
    url: string;
    prefix: string;
  };
  nats: {
    servers: string[];
    wsUrl: string;
    queue: string;
    userJwt: string;
    userSeed: string;
    accountSeed: string;
  };
};

const readVariable = (name: string) => process.env[name] ?? "";

export const appConfig = (): AppConfig => ({
  appEnv: readVariable("APP_ENV") as AppEnvironment,
  logLevel: readVariable("LOG_LEVEL"),
  port: Number(readVariable("PORT")),
  frontendOrigin: readVariable("FRONTEND_ORIGIN"),
  sessionSecret: readVariable("SESSION_SECRET"),
  mongoConn: readVariable("MONGO_CONN"),
  redis: {
    url: readVariable("REDIS_URL"),
    prefix: readVariable("REDIS_PREFIX"),
  },
  nats: {
    servers: readVariable("NATS_SERVERS").split(","),
    wsUrl: readVariable("NATS_WS_URL"),
    queue: readVariable("NATS_QUEUE"),
    userJwt: readVariable("NATS_USER_JWT"),
    userSeed: readVariable("NATS_USER_SEED"),
    accountSeed: readVariable("NATS_ACCOUNT_SEED"),
  },
});
