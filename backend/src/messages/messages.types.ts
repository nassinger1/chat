export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
};

export type CreateMessageInput = {
  conversationId: string;
  senderId: string;
  text: string;
};

export const MAX_MESSAGE_LENGTH = 4000;
