import { AxiosError, type AxiosResponse } from "axios";
import { getErrorMessage } from "./apiError";

const errorWithCode = (code: string) =>
  new AxiosError("Request failed", undefined, undefined, undefined, {
    data: { code },
  } as AxiosResponse);

describe("getErrorMessage", () => {
  it("maps a known code", () => {
    expect(getErrorMessage(errorWithCode("IAM-001"))).toBe(
      "E-mail ou senha inválidos.",
    );
  });

  it("falls back for an unknown code", () => {
    expect(getErrorMessage(errorWithCode("XXX-999"))).toBe(
      "Algo deu errado. Tente novamente.",
    );
  });

  it("falls back for something that is not an axios error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe(
      "Algo deu errado. Tente novamente.",
    );
  });
});
