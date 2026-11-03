import { useRealtime } from "@contexts/useRealtime";
import type { Conversation, LastMessage, User } from "@services/api.types";
import { ChatApi } from "@services/chatApi";
import { UsersApi } from "@services/usersApi";
import { useCallback, useEffect, useState } from "react";

export type Contact = {
  user: User;
  conversationId: string | null;
  unreadCount: number;
  lastMessage: LastMessage | null;
};

const toContacts = (
  users: User[],
  conversations: Conversation[],
): Contact[] => {
  const byPeer = new Map(
    conversations.map((conversation) => [conversation.peer?.id, conversation]),
  );

  return users.map((user) => {
    const conversation = byPeer.get(user.id);

    return {
      user,
      conversationId: conversation?.id ?? null,
      unreadCount: conversation?.unreadCount ?? 0,
      lastMessage: conversation?.lastMessage ?? null,
    };
  });
};

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { subscribeToReconnect } = useRealtime();

  const loadContacts = useCallback(async () => {
    const [users, conversations] = await Promise.all([
      UsersApi.find(),
      ChatApi.findConversations(),
    ]);

    setContacts(toContacts(users, conversations));
  }, []);

  useEffect(() => {
    void loadContacts();

    return subscribeToReconnect(() => void loadContacts());
  }, [loadContacts, subscribeToReconnect]);

  return { contacts };
};
