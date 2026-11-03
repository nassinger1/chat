import { useAuth } from "@contexts/useAuth";
import { useRealtime } from "@contexts/useRealtime";
import type { ChatEvent, User } from "@services/api.types";
import { ChatApi } from "@services/chatApi";
import { UsersApi } from "@services/usersApi";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useContacts } from "./useContacts";

vi.mock("@contexts/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("@contexts/useRealtime", () => ({ useRealtime: vi.fn() }));
vi.mock("@services/chatApi", () => ({
  ChatApi: { findConversations: vi.fn() },
}));
vi.mock("@services/usersApi", () => ({ UsersApi: { find: vi.fn() } }));

const bruno = { id: "bruno", name: "Bruno", status: "offline" } as User;

const createEvent = (name: string, data: unknown) =>
  ({ data, meta: { name } }) as ChatEvent;

describe("useContacts", () => {
  let listener: (event: ChatEvent) => void;

  const load = async () => {
    const { result } = renderHook(() => useContacts());

    await waitFor(() => expect(result.current.contacts).toHaveLength(1));

    return result;
  };

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: "ana" } } as never);
    vi.mocked(useRealtime).mockReturnValue({
      subscribe: (next) => {
        listener = next;

        return () => undefined;
      },
      subscribeToReconnect: () => () => undefined,
    });
    vi.mocked(UsersApi.find).mockResolvedValue([bruno]);
    vi.mocked(ChatApi.findConversations).mockResolvedValue([]);
  });

  it("updates one person's status", async () => {
    const result = await load();

    act(() =>
      listener(
        createEvent("presence-changed", { userId: "bruno", status: "online" }),
      ),
    );

    expect(result.current.contacts[0].user.status).toBe("online");
  });

  it("adds a new user", async () => {
    const result = await load();

    act(() =>
      listener(createEvent("user-created", { id: "carla", name: "Carla" })),
    );

    expect(result.current.contacts).toHaveLength(2);
  });
});
