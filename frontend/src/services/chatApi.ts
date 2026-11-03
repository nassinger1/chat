import type { ChatMessage, Conversation, Paginated } from "./api.types";
import { httpClient } from "./httpClient";

const HISTORY_SIZE = 100;

export class ChatApi {
  static async findConversations() {
    const { data } = await httpClient.get<Conversation[]>("/conversations");

    return data;
  }

  static async openConversation(participantId: string) {
    const { data } = await httpClient.post<Conversation>("/conversations", {
      participantId,
    });

    return data;
  }

  static async findMessages(conversationId: string) {
    const { data } = await httpClient.get<Paginated<ChatMessage>>(
      `/conversations/${conversationId}/messages`,
      { params: { limit: HISTORY_SIZE } },
    );

    return data.items.toReversed();
  }

  static async sendMessage(conversationId: string, text: string) {
    const { data } = await httpClient.post<ChatMessage>(
      `/conversations/${conversationId}/messages`,
      { text },
    );

    return data;
  }

  static async markRead(conversationId: string) {
    await httpClient.post(`/conversations/${conversationId}/read`);
  }
}
