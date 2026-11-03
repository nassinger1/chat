import { MessageBubble } from "@components/MessageBubble";
import type { ChatMessage } from "@services/api.types";
import { useEffect, useRef } from "react";
import "./styles.css";

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId: string;
};

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages.at(-1)?.id;

  useEffect(() => {
    if (lastMessageId && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [lastMessageId]);

  return (
    <div className="message-list" ref={listRef}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          text={message.text}
          createdAt={message.createdAt}
          isOwn={message.senderId === currentUserId}
        />
      ))}
    </div>
  );
}
