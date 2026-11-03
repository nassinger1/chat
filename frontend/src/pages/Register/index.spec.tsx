import { AuthContextProvider } from "@contexts/authContext";
import { AuthApi } from "@services/authApi";
import { UsersApi } from "@services/usersApi";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RegisterPage } from "./index";

vi.mock("@services/authApi", () => ({
  AuthApi: {
    getSession: vi.fn().mockResolvedValue({ user: null }),
    login: vi.fn(),
  },
}));

vi.mock("@services/usersApi", () => ({
  UsersApi: { register: vi.fn() },
}));

const renderPage = () =>
  render(
    <AuthContextProvider>
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<p>home</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContextProvider>,
  );

const submit = async () => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Nome"), "Ana");
  await user.type(screen.getByLabelText("E-mail"), "ana@test.com");
  await user.type(screen.getByLabelText("Senha"), "password123");
  await user.click(screen.getByRole("button", { name: /Criar conta/ }));
};

describe("RegisterPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("logs in and goes to the chat", async () => {
    vi.mocked(AuthApi.login).mockResolvedValue({
      isAuthenticated: true,
      user: { id: "1", name: "Ana", email: "ana@test.com" },
    });

    renderPage();
    await submit();

    expect(await screen.findByText("home")).toBeInTheDocument();
    expect(UsersApi.register).toHaveBeenCalledOnce();
  });

  it("shows the message for a repeated email", async () => {
    vi.mocked(UsersApi.register).mockRejectedValueOnce(
      new AxiosError("Failed", undefined, undefined, undefined, {
        data: { code: "USR-001" },
      } as AxiosResponse),
    );

    renderPage();
    await submit();

    expect(
      await screen.findByText("Este e-mail já está cadastrado."),
    ).toBeInTheDocument();
  });
});
