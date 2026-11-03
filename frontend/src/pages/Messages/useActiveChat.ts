import type { ChatMessage } from "@services/api.types";
import { ChatApi } from "@services/chatApi";
import { useEffect, useState } from "react";

export const useActiveChat = (peerId: string | null) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setConversationId(null);
    setMessages([]);

    if (!peerId) return;

    let isCancelled = false;

    const open = async () => {
      const conversation = await ChatApi.openConversation(peerId);
      const history = await ChatApi.findMessages(conversation.id);

      if (isCancelled) return;

      setConversationId(conversation.id);
      setMessages(history);
    };

    void open();

    return () => {
      isCancelled = true;
    };
  }, [peerId]);

  const sendMessage = async (text: string) => {
    if (!conversationId) return;

    const message = await ChatApi.sendMessage(conversationId, text);

    setMessages((current) => [...current, message]);
  };

  return { conversationId, messages, sendMessage };
};
