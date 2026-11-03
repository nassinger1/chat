import { useAuth } from "@contexts/useAuth";
import { useRealtime } from "@contexts/useRealtime";
import type {
  Conversation,
  LastMessage,
  User,
  UserStatus,
} from "@services/api.types";
import { ChatApi } from "@services/chatApi";
import { UsersApi } from "@services/usersApi";
import { useCallback, useEffect, useState } from "react";

export type Contact = {
  user: User;
  conversationId: string | null;
  unreadCount: number;
  lastMessage: LastMessage | null;
};

type PresenceChange = {
  userId: string;
  status: UserStatus;
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
  const { subscribe, subscribeToReconnect } = useRealtime();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;

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

  useEffect(() => {
    return subscribe((event) => {
      if (event.meta.name === "presence-changed") {
        const { userId, status } = event.data as PresenceChange;

        setContacts((current) =>
          current.map((contact) =>
            contact.user.id === userId
              ? { ...contact, user: { ...contact.user, status } }
              : contact,
          ),
        );
      }

      if (event.meta.name === "user-created") {
        const user = event.data as User;

        if (user.id === currentUserId) return;

        setContacts((current) => [
          ...current,
          { user, conversationId: null, unreadCount: 0, lastMessage: null },
        ]);
      }
    });
  }, [subscribe, currentUserId]);

  return { contacts };
};
