import { AuthCard } from "@components/AuthCard";
import { TextField } from "@components/TextField";
import { useRegisterController } from "./register.controller";
import "../Login/styles.css";

export function RegisterPage() {
  const {
    name,
    email,
    password,
    errorMessage,
    isSubmitting,
    setName,
    setEmail,
    setPassword,
    handleSubmit,
  } = useRegisterController();

  return (
    <AuthCard
      title="Crie sua conta"
      subtitle="Preencha seus dados para começar"
      footerLabel="Já tenho uma conta"
      footerTo="/login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <TextField
          label="Nome"
          required
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
          minLength={8}
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button type="submit" disabled={isSubmitting}>
          Criar conta →
        </button>
      </form>
    </AuthCard>
  );
}
