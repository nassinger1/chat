import "./styles.css";

const timeFormat = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

type MessageBubbleProps = {
  text: string;
  createdAt: string;
  isOwn: boolean;
};

export function MessageBubble({ text, createdAt, isOwn }: MessageBubbleProps) {
  return (
    <div className={`message-bubble ${isOwn ? "own" : ""}`}>
      <p>{text}</p>
      <time dateTime={createdAt}>{timeFormat.format(new Date(createdAt))}</time>
    </div>
  );
}
