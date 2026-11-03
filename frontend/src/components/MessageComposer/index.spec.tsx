import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageComposer } from "./index";

describe("MessageComposer", () => {
  const setup = () => {
    const onSend = vi.fn();

    render(<MessageComposer onSend={onSend} />);

    return { onSend, user: userEvent.setup() };
  };

  it("sends on Enter", async () => {
    const { onSend, user } = setup();

    await user.type(screen.getByLabelText("Mensagem"), "Hi{Enter}");

    expect(onSend).toHaveBeenCalledWith("Hi");
  });

  it("adds a line on Shift+Enter", async () => {
    const { onSend, user } = setup();

    await user.type(
      screen.getByLabelText("Mensagem"),
      "Hi{Shift>}{Enter}{/Shift}",
    );

    expect(onSend).not.toHaveBeenCalled();
  });

  it("blocks empty text", async () => {
    const { onSend, user } = setup();

    await user.type(screen.getByLabelText("Mensagem"), "   {Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });
});
