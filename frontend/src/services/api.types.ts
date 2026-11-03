export type UserStatus = "online" | "offline";

export type User = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  lastSeenAt: string | null;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export type OutputSession = {
  isAuthenticated: boolean;
  user: SessionUser | null;
};

export type InputLogin = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type InputRegister = {
  name: string;
  email: string;
  password: string;
};

export type OutputBrokerCredentials = {
  jwt: string;
  seed: string;
  expiresAt: string;
  wsUrl: string;
};

export type Paginated<Item> = {
  items: Item[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type LastMessage = {
  text: string;
  senderId: string;
  sentAt: string;
};

export type Conversation = {
  id: string;
  peer: User | null;
  unreadCount: number;
  lastMessage: LastMessage | null;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type ChatEvent = {
  type: "change";
  data: unknown;
  meta: {
    namespace: string;
    name: string;
    type: string;
    actorId: string;
    correlationId: string;
  };
};
