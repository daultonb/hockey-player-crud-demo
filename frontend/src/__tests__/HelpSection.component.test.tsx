import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HelpSection from "../components/help/HelpSection";
import { HelpSection as HelpSectionType } from "../components/help/HelpContent";

describe("HelpSection Component", () => {
  const mockSection: HelpSectionType = {
    id: "test-section",
    title: "Test Section",
    icon: "🧪",
    content: [
      {
        type: "heading",
        content: "Test Heading",
      },
      {
        type: "paragraph",
        content: "This is a test paragraph.",
      },
      {
        type: "list",
        content: ["Item 1", "Item 2", "Item 3"],
      },
      {
        type: "tip",
        content: "This is a helpful tip!",
      },
      {
        type: "warning",
        content: "This is a warning message!",
      },
    ],
  };

  describe("Rendering", () => {
    test("renders section header with icon and title", () => {
      render(<HelpSection section={mockSection} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByText("🧪")).toBeInTheDocument();
      expect(screen.getByText("Test Section")).toBeInTheDocument();
    });

    test("does not render content when collapsed by default", () => {
      render(<HelpSection section={mockSection} />);

      expect(screen.queryByText("Test Heading")).not.toBeInTheDocument();
      expect(
        screen.queryByText("This is a test paragraph.")
      ).not.toBeInTheDocument();
    });

    test("renders content when isDefaultOpen is true", () => {
      render(<HelpSection section={mockSection} isDefaultOpen={true} />);

      expect(screen.getByText("Test Heading")).toBeInTheDocument();
      expect(screen.getByText("This is a test paragraph.")).toBeInTheDocument();
    });

    test("shows expand chevron (▶) when collapsed", () => {
      render(<HelpSection section={mockSection} />);

      expect(screen.getByText("▶")).toBeInTheDocument();
    });

    test("shows collapse chevron (▼) when expanded", () => {
      render(<HelpSection section={mockSection} isDefaultOpen={true} />);

      expect(screen.getByText("▼")).toBeInTheDocument();
    });
  });

  describe("Accordion Behavior", () => {
    test("expands section when header is clicked", async () => {
      render(<HelpSection section={mockSection} />);

      const header = screen.getByRole("button");
      expect(screen.queryByText("Test Heading")).not.toBeInTheDocument();

      await userEvent.click(header);

      expect(screen.getByText("Test Heading")).toBeInTheDocument();
      expect(screen.getByText("This is a test paragraph.")).toBeInTheDocument();
    });

    test("collapses section when header is clicked again", async () => {
      render(<HelpSection section={mockSection} isDefaultOpen={true} />);

      const header = screen.getByRole("button");
      expect(screen.getByText("Test Heading")).toBeInTheDocument();

      await userEvent.click(header);

      expect(screen.queryByText("Test Heading")).not.toBeInTheDocument();
    });

    test("toggles chevron when expanding/collapsing", async () => {
      render(<HelpSection section={mockSection} />);

      const header = screen.getByRole("button");
      expect(screen.getByText("▶")).toBeInTheDocument();

      await userEvent.click(header);
      expect(screen.getByText("▼")).toBeInTheDocument();

      await userEvent.click(header);
      expect(screen.getByText("▶")).toBeInTheDocument();
    });
  });

  describe("Content Rendering", () => {
    test("renders headings correctly", () => {
      render(<HelpSection section={mockSection} isDefaultOpen={true} />);

      const heading = screen.getByText("Test Heading");
      expect(heading.tagName).toBe("H4");
      expect(heading).toHaveClass("help-section-heading");
    });

    test("renders paragraphs correctly", () => {
      render(<HelpSection section={mockSection} isDefaultOpen={true} />);

      const paragraph = screen.getByText("This is a test paragraph.");
      expect(paragraph.tagName).toBe("P");
      expect(paragraph).toHaveClass("help-section-paragraph");
    });

    test("renders lists correctly", () => {
      render(<HelpSection section={mockSection} isDefaultOpen={true} />);

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("Item 3")).toBeInTheDocument();

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(3);
    });

    test("renders tips with icon", () => {
      render(<HelpSection section={mockSection} isDefaultOpen={true} />);

      const tip = screen.getByText((content, element) => {
        return element?.textContent === "💡 This is a helpful tip!";
      });
      expect(tip).toBeInTheDocument();
      expect(tip).toHaveClass("help-section-tip");
    });

    test("renders warnings with icon", () => {
      render(<HelpSection section={mockSection} isDefaultOpen={true} />);

      const warning = screen.getByText((content, element) => {
        return element?.textContent === "⚠️ This is a warning message!";
      });
      expect(warning).toBeInTheDocument();
      expect(warning).toHaveClass("help-section-warning");
    });
  });

  describe("Accessibility", () => {
    test("has correct aria-expanded attribute when collapsed", () => {
      render(<HelpSection section={mockSection} />);

      const header = screen.getByRole("button");
      expect(header).toHaveAttribute("aria-expanded", "false");
    });

    test("has correct aria-expanded attribute when expanded", () => {
      render(<HelpSection section={mockSection} isDefaultOpen={true} />);

      const header = screen.getByRole("button");
      expect(header).toHaveAttribute("aria-expanded", "true");
    });

    test("content has region role and proper id", () => {
      render(<HelpSection section={mockSection} isDefaultOpen={true} />);

      const content = screen.getByRole("region");
      expect(content).toHaveAttribute("id", "help-section-test-section");
    });
  });
});
