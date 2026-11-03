import { Avatar } from "@components/Avatar";
import "./styles.css";

type AppHeaderProps = {
  name: string;
  email: string;
  onSignOut: () => void;
};

export function AppHeader({ name, email, onSignOut }: AppHeaderProps) {
  return (
    <header className="app-header">
      <h1>Mensagens</h1>
      <div className="user">
        <div className="details">
          <strong>{name}</strong>
          <span>{email}</span>
        </div>
        <Avatar name={name} />
        <button type="button" onClick={onSignOut}>
          Sair
        </button>
      </div>
    </header>
  );
}
