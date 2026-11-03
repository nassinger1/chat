import { useRealtime } from "@contexts/useRealtime";
import type { ChatMessage } from "@services/api.types";
import { ChatApi } from "@services/chatApi";
import { useCallback, useEffect, useState } from "react";

export const useActiveChat = (peerId: string | null) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { subscribe, subscribeToReconnect } = useRealtime();

  const addMessage = useCallback((incoming: ChatMessage) => {
    setMessages((current) => {
      const isDuplicate = current.some((message) => message.id === incoming.id);

      return isDuplicate ? current : [...current, incoming];
    });
  }, []);

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

  useEffect(() => {
    return subscribe((event) => {
      if (event.meta.name !== "message-created") return;

      const message = event.data as ChatMessage;

      if (message.conversationId === conversationId) addMessage(message);
    });
  }, [subscribe, conversationId, addMessage]);

  useEffect(() => {
    if (!conversationId) return;

    return subscribeToReconnect(() => {
      void ChatApi.findMessages(conversationId).then(setMessages);
    });
  }, [subscribeToReconnect, conversationId]);

  const sendMessage = async (text: string) => {
    if (!conversationId) return;

    addMessage(await ChatApi.sendMessage(conversationId, text));
  };

  return { conversationId, messages, sendMessage };
};
