import { useRealtime } from "@contexts/useRealtime";
import type { ChatEvent, ChatMessage } from "@services/api.types";
import { ChatApi } from "@services/chatApi";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useActiveChat } from "./useActiveChat";

vi.mock("@contexts/useRealtime", () => ({ useRealtime: vi.fn() }));
vi.mock("@services/chatApi", () => ({
  ChatApi: {
    openConversation: vi.fn(),
    findMessages: vi.fn(),
    markRead: vi.fn(),
  },
}));

const createMessage = (id: string, conversationId: string) =>
  ({ id, conversationId, text: "Hi" }) as ChatMessage;

const createEvent = (message: ChatMessage) =>
  ({ data: message, meta: { name: "message-created" } }) as ChatEvent;

describe("useActiveChat", () => {
  let listener: (event: ChatEvent) => void;

  const open = async () => {
    const { result } = renderHook(() => useActiveChat("bruno"));

    await waitFor(() => expect(result.current.conversationId).toBe("1"));

    return result;
  };

  beforeEach(() => {
    vi.mocked(useRealtime).mockReturnValue({
      subscribe: (next) => {
        listener = next;

        return () => undefined;
      },
      subscribeToReconnect: () => () => undefined,
    });
    vi.mocked(ChatApi.openConversation).mockResolvedValue({
      id: "1",
    } as never);
    vi.mocked(ChatApi.findMessages).mockResolvedValue([]);
  });

  it("adds a live message", async () => {
    const result = await open();

    act(() => listener(createEvent(createMessage("a", "1"))));

    expect(result.current.messages).toHaveLength(1);
  });

  it("ignores a duplicate event", async () => {
    const result = await open();
    const event = createEvent(createMessage("a", "1"));

    act(() => {
      listener(event);
      listener(event);
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it("ignores another conversation", async () => {
    const result = await open();

    act(() => listener(createEvent(createMessage("a", "2"))));

    expect(result.current.messages).toHaveLength(0);
  });
});
