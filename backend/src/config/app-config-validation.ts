const REQUIRED_VARIABLES = [
  "APP_ENV",
  "LOG_LEVEL",
  "PORT",
  "FRONTEND_ORIGIN",
  "SESSION_SECRET",
  "MONGO_CONN",
  "REDIS_URL",
  "REDIS_PREFIX",
  "NATS_SERVERS",
  "NATS_WS_URL",
  "NATS_QUEUE",
  "NATS_USER_JWT",
  "NATS_USER_SEED",
  "NATS_ACCOUNT_SEED",
];

export function validateAppConfig(variables: Record<string, unknown>) {
  const missing = REQUIRED_VARIABLES.filter((name) => !variables[name]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  return variables;
}
