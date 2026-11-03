import { AppHeader } from "@components/AppHeader";
import { ChatHeader } from "@components/ChatHeader";
import { ContactList } from "@components/ContactList";
import { EmptyChat } from "@components/EmptyChat";
import { MessageComposer } from "@components/MessageComposer";
import { MessageList } from "@components/MessageList";
import { useMessagesController } from "./messages.controller";
import "./styles.css";

export function MessagesPage() {
  const {
    user,
    contacts,
    messages,
    selectedContact,
    selectedUserId,
    setSelectedUserId,
    sendMessage,
    signOut,
  } = useMessagesController();

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
          <section className="chat">
            {selectedContact ? (
              <>
                <ChatHeader peer={selectedContact.user} />
                <MessageList messages={messages} currentUserId={user.id} />
                <MessageComposer onSend={(text) => void sendMessage(text)} />
              </>
            ) : (
              <EmptyChat />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
