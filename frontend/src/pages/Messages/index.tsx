import { AppHeader } from "@components/AppHeader";
import { ContactList } from "@components/ContactList";
import { useMessagesController } from "./messages.controller";
import "./styles.css";

export function MessagesPage() {
  const { user, contacts, selectedUserId, setSelectedUserId, signOut } =
    useMessagesController();

  if (!user) return null;

  return (
    <main className="messages-page">
      <div className="panel">
        <AppHeader
          name={user.name}
          email={user.email}
          onSignOut={() => void signOut()}
        />
        <div className="columns">
          <ContactList
            contacts={contacts}
            currentUserId={user.id}
            selectedUserId={selectedUserId}
            onSelect={setSelectedUserId}
          />
          <section className="chat" />
        </div>
      </div>
    </main>
  );
}
