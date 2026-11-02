export enum UserStatus {
  ONLINE = "online",
  OFFLINE = "offline",
}

export type User = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  lastSeenAt: Date | null;
  createdAt: Date;
};

export type UserWithPassword = User & { password: string };

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};
