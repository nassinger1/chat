export type BrokerCredentialsResDto = {
  jwt: string;
  seed: string;
  expiresAt: Date;
  wsUrl: string;
};

export function toBrokerCredentialsResDto(
  credentials: BrokerCredentialsResDto,
): BrokerCredentialsResDto {
  return {
    jwt: credentials.jwt,
    seed: credentials.seed,
    expiresAt: credentials.expiresAt,
    wsUrl: credentials.wsUrl,
  };
}
