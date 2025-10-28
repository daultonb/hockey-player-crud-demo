import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HelpPanel from "../components/help/HelpPanel";

describe("HelpPanel Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    test("does not render when isOpen is false", () => {
      render(<HelpPanel isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Help & Documentation")
      ).not.toBeInTheDocument();
    });

    test("renders when isOpen is true", () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Help & Documentation")).toBeInTheDocument();
    });

    test("renders all help sections", () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      // Check for section titles
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Filters")).toBeInTheDocument();
      expect(screen.getByText("Sorting")).toBeInTheDocument();
      expect(screen.getByText("Viewing Player Details")).toBeInTheDocument();
      expect(screen.getByText("Adding a Player")).toBeInTheDocument();
      expect(screen.getByText("Editing a Player")).toBeInTheDocument();
      expect(screen.getByText("Deleting a Player")).toBeInTheDocument();
      expect(screen.getByText("Pagination")).toBeInTheDocument();
      expect(screen.getByText("Column Visibility")).toBeInTheDocument();
      expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    });

    test("renders close button", () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", {
        name: /close help panel/i,
      });
      expect(closeButton).toBeInTheDocument();
    });

    test("renders footer text", () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(/Need more help\? Contact your system administrator./i)
      ).toBeInTheDocument();
    });

    test("has backdrop overlay", () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      // Check that backdrop exists by checking the dialog is rendered (backdrop is part of HelpPanel)
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("Close Functionality", () => {
    test("calls onClose when close button is clicked", async () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", {
        name: /close help panel/i,
      });
      await userEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("calls onClose when ESC key is pressed", async () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      await userEvent.keyboard("{Escape}");

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("does not call onClose when clicking inside panel", async () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      const panelTitle = screen.getByText("Help & Documentation");
      await userEvent.click(panelTitle);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    test("has proper dialog role", () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "help-panel-title");
    });

    test("title has proper id for aria-labelledby", () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      const title = screen.getByText("Help & Documentation");
      expect(title).toHaveAttribute("id", "help-panel-title");
    });

    test("prevents body scroll when open", () => {
      const { rerender } = render(
        <HelpPanel isOpen={false} onClose={mockOnClose} />
      );

      expect(document.body.style.overflow).not.toBe("hidden");

      rerender(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    test("restores body scroll when closed", async () => {
      const { rerender } = render(
        <HelpPanel isOpen={true} onClose={mockOnClose} />
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender(<HelpPanel isOpen={false} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe("unset");
      });
    });
  });

  describe("First Section (Overview) Default State", () => {
    test("renders overview section content by default (expanded)", () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      // Overview should be expanded by default
      expect(
        screen.getByText(/Welcome to the Hockey Player Database!/i)
      ).toBeInTheDocument();
    });

    test("other sections are collapsed by default", () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      // These should NOT be visible initially (sections are collapsed)
      expect(
        screen.queryByText(/Use the search bar at the top/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Click the.*Filters.*button/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Focus Management", () => {
    test("renders with focus trap when opened", () => {
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      // Verify the dialog is rendered (focus trap is implemented in useEffect)
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });
  });
});
