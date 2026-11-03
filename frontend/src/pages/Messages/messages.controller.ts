import { useAuth } from "@contexts/useAuth";
import { useState } from "react";
import { useActiveChat } from "./useActiveChat";
import { useContacts } from "./useContacts";
import { useUnreadTitle } from "./useUnreadTitle";

export const useMessagesController = () => {
  const { user, signOut } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { contacts } = useContacts(selectedUserId);
  const { messages, sendMessage } = useActiveChat(selectedUserId);

  const selectedContact = contacts.find(
    (contact) => contact.user.id === selectedUserId,
  );
  const unreadCount = contacts.reduce(
    (total, contact) => total + contact.unreadCount,
    0,
  );

  useUnreadTitle(unreadCount);

  return {
    user,
    contacts,
    messages,
    selectedContact,
    selectedUserId,
    setSelectedUserId,
    sendMessage,
    signOut,
  };
};
