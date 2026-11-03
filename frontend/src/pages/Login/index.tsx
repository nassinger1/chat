import { AuthCard } from "@components/AuthCard";
import { TextField } from "@components/TextField";
import { useLoginController } from "./login.controller";
import "./styles.css";

export function LoginPage() {
  const {
    email,
    password,
    rememberMe,
    errorMessage,
    isSubmitting,
    setEmail,
    setPassword,
    setRememberMe,
    handleSubmit,
  } = useLoginController();

  return (
    <AuthCard
      title="Acesse sua conta"
      subtitle="Insira suas credenciais para fazer login"
      footerLabel="Criar uma nova conta"
      footerTo="/register"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <TextField
          label="E-mail"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Senha"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <label className="remember">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          Continuar conectado
        </label>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button type="submit" disabled={isSubmitting}>
          Acessar →
        </button>
      </form>
    </AuthCard>
  );
}
