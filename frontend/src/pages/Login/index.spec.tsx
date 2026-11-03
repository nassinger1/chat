import { AuthContextProvider } from "@contexts/authContext";
import { AuthApi } from "@services/authApi";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "./index";

vi.mock("@services/authApi", () => ({
  AuthApi: {
    getSession: vi.fn().mockResolvedValue({ user: null }),
    login: vi.fn(),
  },
}));

const renderPage = () =>
  render(
    <AuthContextProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<p>home</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContextProvider>,
  );

const submit = async () => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("E-mail"), "ana@test.com");
  await user.type(screen.getByLabelText("Senha"), "password123");
  await user.click(screen.getByRole("button", { name: /Acessar/ }));
};

describe("LoginPage", () => {
  it("goes to the chat on success", async () => {
    vi.mocked(AuthApi.login).mockResolvedValue({
      isAuthenticated: true,
      user: { id: "1", name: "Ana", email: "ana@test.com" },
    });

    renderPage();
    await submit();

    expect(await screen.findByText("home")).toBeInTheDocument();
  });

  it("shows the message on failure", async () => {
    vi.mocked(AuthApi.login).mockRejectedValue(
      new AxiosError("Failed", undefined, undefined, undefined, {
        data: { code: "IAM-001" },
      } as AxiosResponse),
    );

    renderPage();
    await submit();

    expect(
      await screen.findByText("E-mail ou senha inválidos."),
    ).toBeInTheDocument();
  });
});
