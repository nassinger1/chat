import { useAuth } from "@contexts/useAuth";
import { useState } from "react";
import { useActiveChat } from "./useActiveChat";
import { useContacts } from "./useContacts";

export const useMessagesController = () => {
  const { user, signOut } = useAuth();
  const { contacts } = useContacts();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { messages, sendMessage } = useActiveChat(selectedUserId);

  const selectedContact = contacts.find(
    (contact) => contact.user.id === selectedUserId,
  );

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
