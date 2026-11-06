import { renderHook } from "@testing-library/react";
import { useUnreadTitle } from "./useUnreadTitle";

describe("useUnreadTitle", () => {
  it("shows how many messages are unread", () => {
    renderHook(() => useUnreadTitle(3));

    expect(document.title).toBe("(3) Mensagens");
  });

  it("shows only the page name when nothing is unread", () => {
    renderHook(() => useUnreadTitle(0));

    expect(document.title).toBe("Mensagens");
  });

  it("follows the count as it changes", () => {
    const { rerender } = renderHook(
      ({ unreadCount }) => useUnreadTitle(unreadCount),
      { initialProps: { unreadCount: 1 } },
    );

    rerender({ unreadCount: 2 });
    expect(document.title).toBe("(2) Mensagens");

    rerender({ unreadCount: 0 });
    expect(document.title).toBe("Mensagens");
  });
});
