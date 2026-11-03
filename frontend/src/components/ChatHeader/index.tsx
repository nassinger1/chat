import { Avatar } from "@components/Avatar";
import { StatusDot } from "@components/StatusDot";
import type { User } from "@services/api.types";
import "./styles.css";

export function ChatHeader({ peer }: { peer: User }) {
  return (
    <header className="chat-header">
      <Avatar name={peer.name} />
      <div className="details">
        <strong>{peer.name}</strong>
        <StatusDot status={peer.status} />
      </div>
    </header>
  );
}
