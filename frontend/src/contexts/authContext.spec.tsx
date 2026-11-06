import { AuthApi } from "@services/authApi";
import { act, renderHook, waitFor } from "@testing-library/react";
import { AuthContextProvider } from "./authContext";
import { useAuth } from "./useAuth";

vi.mock("@services/authApi", () => ({
  AuthApi: {
    getSession: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

const ana = { id: "1", name: "Ana", email: "ana@test.com" };
const credentials = {
  email: "ana@test.com",
  password: "password123",
  rememberMe: false,
};

const renderAuth = async () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: AuthContextProvider,
  });

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  return result;
};

describe("AuthContextProvider", () => {
  beforeEach(() => {
    vi.mocked(AuthApi.getSession).mockResolvedValue({
      isAuthenticated: false,
      user: null,
    });
  });

  it("is loading until it knows who is signed in", () => {
    vi.mocked(AuthApi.getSession).mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthContextProvider,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("keeps you signed in after a page reload", async () => {
    vi.mocked(AuthApi.getSession).mockResolvedValue({
      isAuthenticated: true,
      user: ana,
    });

    const result = await renderAuth();

    expect(result.current.user).toEqual(ana);
  });

  it("has no user when there is no session", async () => {
    const result = await renderAuth();

    expect(result.current.user).toBeNull();
  });

  it("has no user when the session check fails", async () => {
    vi.mocked(AuthApi.getSession).mockRejectedValue(new Error("offline"));

    const result = await renderAuth();

    expect(result.current.user).toBeNull();
  });

  it("signs you in", async () => {
    vi.mocked(AuthApi.login).mockResolvedValue({
      isAuthenticated: true,
      user: ana,
    });

    const result = await renderAuth();

    await act(() => result.current.signIn(credentials));

    expect(AuthApi.login).toHaveBeenCalledWith(credentials);
    expect(result.current.user).toEqual(ana);
  });

  it("keeps you signed out and lets the screen see a failed sign in", async () => {
    vi.mocked(AuthApi.login).mockRejectedValue(new Error("IAM-001"));

    const result = await renderAuth();

    const signingIn = act(() => result.current.signIn(credentials));

    await expect(signingIn).rejects.toThrow("IAM-001");
    expect(result.current.user).toBeNull();
  });

  it("signs you out", async () => {
    vi.mocked(AuthApi.getSession).mockResolvedValue({
      isAuthenticated: true,
      user: ana,
    });
    vi.mocked(AuthApi.logout).mockResolvedValue();

    const result = await renderAuth();

    await act(() => result.current.signOut());

    expect(AuthApi.logout).toHaveBeenCalledOnce();
    expect(result.current.user).toBeNull();
  });
});
