import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Toast from "../components/Toast";

describe("Toast Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render toast with message", () => {
      const onClose = jest.fn();
      render(<Toast message="Test message" type="success" onClose={onClose} />);

      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("should have role alert for accessibility", () => {
      const onClose = jest.fn();
      render(<Toast message="Test message" type="success" onClose={onClose} />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should have close button with aria-label", () => {
      const onClose = jest.fn();
      render(<Toast message="Test message" type="success" onClose={onClose} />);

      expect(screen.getByLabelText("Close notification")).toBeInTheDocument();
    });
  });

  describe("Toast Types", () => {
    it("should render success toast with correct class and icon", () => {
      const onClose = jest.fn();
      const { container } = render(
        <Toast message="Success!" type="success" onClose={onClose} />
      );

      const toast = container.querySelector(".toast-success");
      expect(toast).toBeInTheDocument();
      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("should render error toast with correct class and icon", () => {
      const onClose = jest.fn();
      const { container } = render(
        <Toast message="Error occurred" type="error" onClose={onClose} />
      );

      const toast = container.querySelector(".toast-error");
      expect(toast).toBeInTheDocument();
      expect(screen.getByText("✕")).toBeInTheDocument();
    });

    it("should render info toast with correct class and icon", () => {
      const onClose = jest.fn();
      const { container } = render(
        <Toast message="Info message" type="info" onClose={onClose} />
      );

      const toast = container.querySelector(".toast-info");
      expect(toast).toBeInTheDocument();
      expect(screen.getByText("i")).toBeInTheDocument();
    });
  });

  describe("Manual Close", () => {
    it("should call onClose when close button is clicked", () => {
      const onClose = jest.fn();
      render(<Toast message="Test message" type="success" onClose={onClose} />);

      const closeButton = screen.getByLabelText("Close notification");
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Auto-dismiss", () => {
    it("should auto-dismiss after default duration (5000ms)", () => {
      const onClose = jest.fn();
      render(<Toast message="Test message" type="success" onClose={onClose} />);

      expect(onClose).not.toHaveBeenCalled();

      jest.advanceTimersByTime(5000);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should auto-dismiss after custom duration", () => {
      const onClose = jest.fn();
      render(
        <Toast
          message="Test message"
          type="success"
          onClose={onClose}
          duration={3000}
        />
      );

      expect(onClose).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2999);
      expect(onClose).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not auto-dismiss before duration expires", () => {
      const onClose = jest.fn();
      render(<Toast message="Test message" type="success" onClose={onClose} />);

      jest.advanceTimersByTime(4999);
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should clear timeout on unmount", () => {
      const onClose = jest.fn();
      const { unmount } = render(
        <Toast message="Test message" type="success" onClose={onClose} />
      );

      jest.advanceTimersByTime(2500);
      unmount();
      jest.advanceTimersByTime(2500);

      // onClose should not be called after unmount
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Multiple Toast Scenarios", () => {
    it("should handle multiple toasts with different types", () => {
      const onClose1 = jest.fn();
      const onClose2 = jest.fn();
      const onClose3 = jest.fn();

      const { container } = render(
        <div>
          <Toast message="Success!" type="success" onClose={onClose1} />
          <Toast message="Error!" type="error" onClose={onClose2} />
          <Toast message="Info!" type="info" onClose={onClose3} />
        </div>
      );

      expect(screen.getByText("Success!")).toBeInTheDocument();
      expect(screen.getByText("Error!")).toBeInTheDocument();
      expect(screen.getByText("Info!")).toBeInTheDocument();

      expect(container.querySelectorAll(".toast-success")).toHaveLength(1);
      expect(container.querySelectorAll(".toast-error")).toHaveLength(1);
      expect(container.querySelectorAll(".toast-info")).toHaveLength(1);
    });

    it("should handle each toast auto-dismiss independently", () => {
      const onClose1 = jest.fn();
      const onClose2 = jest.fn();

      render(
        <div>
          <Toast
            message="First"
            type="success"
            onClose={onClose1}
            duration={3000}
          />
          <Toast
            message="Second"
            type="info"
            onClose={onClose2}
            duration={5000}
          />
        </div>
      );

      jest.advanceTimersByTime(3000);
      expect(onClose1).toHaveBeenCalledTimes(1);
      expect(onClose2).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2000);
      expect(onClose2).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty message", () => {
      const onClose = jest.fn();
      render(<Toast message="" type="success" onClose={onClose} />);

      const messageElement = screen.getByText("", {
        selector: ".toast-message",
      });
      expect(messageElement).toBeInTheDocument();
    });

    it("should handle very long message", () => {
      const onClose = jest.fn();
      const longMessage = "A".repeat(500);
      render(<Toast message={longMessage} type="success" onClose={onClose} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle duration of 0 (immediate dismiss)", () => {
      const onClose = jest.fn();
      render(
        <Toast message="Test" type="success" onClose={onClose} duration={0} />
      );

      jest.advanceTimersByTime(0);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should handle very short duration", () => {
      const onClose = jest.fn();
      render(
        <Toast message="Test" type="success" onClose={onClose} duration={100} />
      );

      jest.advanceTimersByTime(100);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should handle very long duration", () => {
      const onClose = jest.fn();
      render(
        <Toast
          message="Test"
          type="success"
          onClose={onClose}
          duration={60000}
        />
      );

      jest.advanceTimersByTime(59999);
      expect(onClose).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Interaction with Auto-dismiss", () => {
    it("should allow manual close before auto-dismiss", () => {
      const onClose = jest.fn();
      render(<Toast message="Test" type="success" onClose={onClose} />);

      jest.advanceTimersByTime(2500);
      expect(onClose).not.toHaveBeenCalled();

      const closeButton = screen.getByLabelText("Close notification");
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should have timer still fire after manual close if not unmounted", () => {
      const onClose = jest.fn();
      render(<Toast message="Test" type="success" onClose={onClose} />);

      const closeButton = screen.getByLabelText("Close notification");
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);

      // Timer will still fire since component wasn't unmounted
      jest.advanceTimersByTime(5000);
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });
});
