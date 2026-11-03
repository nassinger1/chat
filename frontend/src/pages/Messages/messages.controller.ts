import { useAuth } from "@contexts/useAuth";
import { useState } from "react";
import { useContacts } from "./useContacts";

export const useMessagesController = () => {
  const { user, signOut } = useAuth();
  const { contacts } = useContacts();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return { user, contacts, selectedUserId, setSelectedUserId, signOut };
};
