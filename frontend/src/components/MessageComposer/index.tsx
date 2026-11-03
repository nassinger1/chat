import { type FormEvent, type KeyboardEvent, useState } from "react";
import "./styles.css";

type MessageComposerProps = {
  onSend: (text: string) => void;
};

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState("");

  const send = () => {
    const trimmed = text.trim();

    if (!trimmed) return;

    onSend(trimmed);
    setText("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    send();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    send();
  };

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <textarea
        aria-label="Mensagem"
        placeholder="Digite sua mensagem aqui"
        rows={2}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="submit">Enviar →</button>
    </form>
  );
}
