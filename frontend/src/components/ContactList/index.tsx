import { ContactItem } from "@components/ContactItem";
import type { Contact } from "@pages/Messages/useContacts";
import "./styles.css";

type ContactListProps = {
  contacts: Contact[];
  currentUserId: string;
  selectedUserId: string | null;
  onSelect: (userId: string) => void;
};

export function ContactList({
  contacts,
  currentUserId,
  selectedUserId,
  onSelect,
}: ContactListProps) {
  return (
    <nav className="contact-list">
      {contacts.map((contact) => (
        <ContactItem
          key={contact.user.id}
          contact={contact}
          currentUserId={currentUserId}
          isSelected={contact.user.id === selectedUserId}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}
