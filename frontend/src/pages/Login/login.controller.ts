import { useAuth } from "@contexts/useAuth";
import { getErrorMessage } from "@services/apiError";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useLoginController = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signIn({ email, password, rememberMe });
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    password,
    rememberMe,
    errorMessage,
    isSubmitting,
    setEmail,
    setPassword,
    setRememberMe,
    handleSubmit,
  };
};
