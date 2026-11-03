import { Avatar } from "@components/Avatar";
import { StatusDot } from "@components/StatusDot";
import type { Contact } from "@pages/Messages/useContacts";
import "./styles.css";

type ContactItemProps = {
  contact: Contact;
  currentUserId: string;
  isSelected: boolean;
  onSelect: (userId: string) => void;
};

export function ContactItem({
  contact,
  currentUserId,
  isSelected,
  onSelect,
}: ContactItemProps) {
  const { user, lastMessage, unreadCount } = contact;
  const prefix = lastMessage?.senderId === currentUserId ? "Você enviou: " : "";
  const preview = lastMessage ? `${prefix}${lastMessage.text}` : "";

  return (
    <button
      type="button"
      className={`contact-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(user.id)}
    >
      <Avatar name={user.name} />
      <span className="details">
        <strong>{user.name}</strong>
        <StatusDot status={user.status} />
        <em>{preview}</em>
      </span>
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
    </button>
  );
}
