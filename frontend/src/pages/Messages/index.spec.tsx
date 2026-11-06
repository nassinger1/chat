import { useAuth } from "@contexts/useAuth";
import type { ChatMessage, User } from "@services/api.types";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessagesPage } from "./index";
import { useActiveChat } from "./useActiveChat";
import { type Contact, useContacts } from "./useContacts";

vi.mock("@contexts/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("./useContacts", () => ({ useContacts: vi.fn() }));
vi.mock("./useActiveChat", () => ({ useActiveChat: vi.fn() }));

const ana = { id: "ana", name: "Ana", email: "ana@test.com" };

const createContact = (user: Partial<User>, unreadCount = 0): Contact => ({
  user: {
    id: "",
    name: "",
    email: "",
    status: "offline",
    lastSeenAt: null,
    ...user,
  },
  conversationId: null,
  unreadCount,
  lastMessage: null,
});

const bruno = createContact({ id: "bruno", name: "Bruno", status: "online" });
const carla = createContact({ id: "carla", name: "Carla" });

const messageFromBruno = {
  id: "1",
  conversationId: "1",
  senderId: "bruno",
  text: "Oi, Ana",
  createdAt: "2026-01-01T12:00:00.000Z",
} as ChatMessage;

const sendMessage = vi.fn();
const signOut = vi.fn();

const getChatHeader = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".chat-header");

describe("MessagesPage", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: ana, signOut } as never);
    vi.mocked(useContacts).mockReturnValue({ contacts: [bruno, carla] });
    vi.mocked(useActiveChat).mockImplementation((peerId) => ({
      conversationId: peerId ? "1" : null,
      messages: peerId === "bruno" ? [messageFromBruno] : [],
      sendMessage,
    }));
    sendMessage.mockReset();
    signOut.mockReset().mockResolvedValue(undefined);
  });

  it("shows your name and email in the header", () => {
    render(<MessagesPage />);

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("ana@test.com")).toBeInTheDocument();
  });

  it("asks you to pick a contact before showing a chat", () => {
    render(<MessagesPage />);

    expect(
      screen.getByText("Selecione um contato para conversar"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Mensagem" }),
    ).not.toBeInTheDocument();
  });

  it("opens the chat with the contact you click", async () => {
    const user = userEvent.setup();
    const { container } = render(<MessagesPage />);

    await user.click(screen.getByRole("button", { name: /Bruno/ }));

    const chatHeader = getChatHeader(container);

    expect(chatHeader).not.toBeNull();
    expect(
      within(chatHeader as HTMLElement).getByText("Bruno"),
    ).toBeInTheDocument();
    expect(
      within(chatHeader as HTMLElement).getByText("Online"),
    ).toBeInTheDocument();
    expect(screen.getByText("Oi, Ana")).toBeInTheDocument();
    expect(useActiveChat).toHaveBeenLastCalledWith("bruno");
  });

  it("switches to another contact", async () => {
    const user = userEvent.setup();
    const { container } = render(<MessagesPage />);

    await user.click(screen.getByRole("button", { name: /Bruno/ }));
    await user.click(screen.getByRole("button", { name: /Carla/ }));

    const chatHeader = getChatHeader(container) as HTMLElement;

    expect(within(chatHeader).getByText("Carla")).toBeInTheDocument();
    expect(screen.queryByText("Oi, Ana")).not.toBeInTheDocument();
  });

  it("sends what you type to the open chat", async () => {
    const user = userEvent.setup();

    render(<MessagesPage />);

    await user.click(screen.getByRole("button", { name: /Bruno/ }));
    await user.type(screen.getByRole("textbox", { name: "Mensagem" }), "Oi");
    await user.click(screen.getByRole("button", { name: /Enviar/ }));

    expect(sendMessage).toHaveBeenCalledWith("Oi");
  });

  it("signs you out", async () => {
    const user = userEvent.setup();

    render(<MessagesPage />);

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(signOut).toHaveBeenCalledOnce();
  });

  it("shows the total of unread messages in the tab title", () => {
    vi.mocked(useContacts).mockReturnValue({
      contacts: [
        createContact({ id: "bruno", name: "Bruno" }, 2),
        createContact({ id: "carla", name: "Carla" }, 1),
      ],
    });

    render(<MessagesPage />);

    expect(document.title).toBe("(3) Mensagens");
  });
});
