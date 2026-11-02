import type { User } from "@/users/users.types.js";

export type ConversationParticipant = {
  userId: string;
  unreadCount: number;
};

export type LastMessage = {
  text: string;
  senderId: string;
  sentAt: Date;
};

export type Conversation = {
  id: string;
  participants: ConversationParticipant[];
  lastMessage: LastMessage | null;
  updatedAt: Date;
};

export type ConversationWithPeer = Conversation & {
  peer: User | null;
  unreadCount: number;
};

export type RecordMessageInput = {
  id: string;
  senderId: string;
  text: string;
  sentAt: Date;
};

export type ParticipantLookup = {
  id: string;
  userId: string;
};
