import { useAuth } from "@contexts/useAuth";
import { useRealtime } from "@contexts/useRealtime";
import type {
  ChatMessage,
  Conversation,
  LastMessage,
  User,
  UserStatus,
} from "@services/api.types";
import { ChatApi } from "@services/chatApi";
import { UsersApi } from "@services/usersApi";
import { useCallback, useEffect, useRef, useState } from "react";

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

type ConversationRead = {
  conversationId: string;
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

const applyMessage = (
  contact: Contact,
  message: ChatMessage,
  isChatOpen: boolean,
): Contact => {
  const isFromContact = message.senderId === contact.user.id;

  return {
    ...contact,
    conversationId: message.conversationId,
    unreadCount:
      isFromContact && !isChatOpen
        ? contact.unreadCount + 1
        : contact.unreadCount,
    lastMessage: {
      text: message.text,
      senderId: message.senderId,
      sentAt: message.createdAt,
    },
  };
};

export const useContacts = (activeUserId: string | null) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { subscribe, subscribeToReconnect } = useRealtime();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;
  const activeUserIdRef = useRef(activeUserId);

  useEffect(() => {
    activeUserIdRef.current = activeUserId;
  }, [activeUserId]);

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

      if (event.meta.name === "message-created") {
        const message = event.data as ChatMessage;

        setContacts((current) =>
          current.map((contact) => {
            const isChatOpen = contact.user.id === activeUserIdRef.current;
            const isSameChat =
              contact.conversationId === message.conversationId ||
              contact.user.id === message.senderId ||
              (isChatOpen && message.senderId === currentUserId);

            if (!isSameChat) return contact;

            return applyMessage(contact, message, isChatOpen);
          }),
        );
      }

      if (event.meta.name === "conversation-read") {
        const { conversationId } = event.data as ConversationRead;

        setContacts((current) =>
          current.map((contact) =>
            contact.conversationId === conversationId
              ? { ...contact, unreadCount: 0 }
              : contact,
          ),
        );
      }
    });
  }, [subscribe, currentUserId]);

  return { contacts };
};
