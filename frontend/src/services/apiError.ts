import { isAxiosError } from "axios";

const ERROR_MESSAGES: Record<string, string> = {
  "IAM-001": "E-mail ou senha inválidos.",
  "USR-001": "Este e-mail já está cadastrado.",
  "VAL-001": "Confira os campos preenchidos.",
};

const DEFAULT_ERROR_MESSAGE = "Algo deu errado. Tente novamente.";

export const getErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) return DEFAULT_ERROR_MESSAGE;

  const code: unknown = error.response?.data?.code;

  if (typeof code !== "string") return DEFAULT_ERROR_MESSAGE;

  return ERROR_MESSAGES[code] ?? DEFAULT_ERROR_MESSAGE;
};
