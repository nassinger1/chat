import { useAuth } from "@contexts/useAuth";
import { getErrorMessage } from "@services/apiError";
import { UsersApi } from "@services/usersApi";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useRegisterController = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await UsersApi.register({ name, email, password });
      await signIn({ email, password, rememberMe: false });
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    email,
    password,
    errorMessage,
    isSubmitting,
    setName,
    setEmail,
    setPassword,
    handleSubmit,
  };
};
