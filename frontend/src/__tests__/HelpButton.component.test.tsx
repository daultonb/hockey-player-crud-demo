import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HelpButton from "../components/help/HelpButton";

describe("HelpButton Component", () => {
  describe("Rendering", () => {
    test("renders with help icon and text", () => {
      render(<HelpButton onClick={() => {}} />);

      expect(
        screen.getByRole("button", { name: /open help documentation/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Help")).toBeInTheDocument();
    });

    test("has correct aria attributes", () => {
      render(<HelpButton onClick={() => {}} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Open help documentation");
      expect(button).toHaveAttribute("title", "Help & Documentation");
    });

    test("has help-button test id", () => {
      render(<HelpButton onClick={() => {}} />);

      expect(screen.getByTestId("help-button")).toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    test("calls onClick when clicked", async () => {
      const handleClick = jest.fn();
      render(<HelpButton onClick={handleClick} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("calls onClick multiple times on multiple clicks", async () => {
      const handleClick = jest.fn();
      render(<HelpButton onClick={handleClick} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);
      await userEvent.click(button);
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });
});
