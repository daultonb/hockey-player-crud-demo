import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import React from "react";
import PlayerFormModal from "../components/modals/PlayerFormModal";
import { ToastProvider } from "../components/ToastContainer";

// Mock axios with proper Jest pattern
jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

// Create typed reference to mocked axios
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockTeams = [
  { id: 1, name: "Team A", abbreviation: "TMA" },
  { id: 2, name: "Team B", abbreviation: "TMB" },
];

const mockPlayer = {
  id: 1,
  name: "Test Player",
  jersey_number: 99,
  position: "C",
  team: { id: 1, name: "Team A", abbreviation: "TMA" },
  nationality: "Canada",
  birth_date: "1990-01-01",
  height: "6'0\"",
  weight: 200,
  handedness: "Right",
  active_status: true,
  regular_season_games_played: 82,
  regular_season_goals: 50,
  regular_season_assists: 60,
  regular_season_points: 110,
  playoff_games_played: 10,
  playoff_goals: 5,
  playoff_assists: 8,
  playoff_points: 13,
  games_played: 92,
  goals: 55,
  assists: 68,
  points: 123,
};

describe("PlayerFormModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockTeams });
  });

  const renderModal = (props = {}) => {
    return render(
      <ToastProvider>
        <PlayerFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode="add"
          {...props}
        />
      </ToastProvider>
    );
  };

  describe("Modal Rendering", () => {
    it("should render add mode modal", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Add Player" })).toBeInTheDocument();
      });
    });

    it("should render edit mode modal", async () => {
      renderModal({ mode: "edit", player: mockPlayer });

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Edit Player" })).toBeInTheDocument();
      });
    });

    it("should not render when isOpen is false", () => {
      renderModal({ isOpen: false });

      expect(screen.queryByRole("heading", { name: "Add Player" })).not.toBeInTheDocument();
    });

    it("should fetch teams when modal opens", async () => {
      renderModal();

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining("/teams")
        );
      });
    });
  });

  describe("Form Fields", () => {
    it("should render all required form fields", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Jersey Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Position/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Team/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nationality/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Birth Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Height/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
      expect(screen.getByLabelText("Left")).toBeInTheDocument();
      expect(screen.getByLabelText("Right")).toBeInTheDocument();
    });

    it("should populate form fields in edit mode", async () => {
      renderModal({ mode: "edit", player: mockPlayer });

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
        expect(nameInput.value).toBe("Test Player");
      });

      const jerseyInput = screen.getByLabelText(/Jersey Number/i) as HTMLInputElement;
      expect(jerseyInput.value).toBe("99");
    });

    it("should handle input changes", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/i);
      await userEvent.type(nameInput, "New Player");

      expect(nameInput).toHaveValue("New Player");
    });

    it("should handle active status radio buttons", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByLabelText("Active")).toBeInTheDocument();
      });

      const activeRadio = screen.getByLabelText("Active") as HTMLInputElement;
      const retiredRadio = screen.getByLabelText("Retired") as HTMLInputElement;

      expect(activeRadio.checked).toBe(true);
      expect(retiredRadio.checked).toBe(false);

      await userEvent.click(retiredRadio);
      expect(activeRadio.checked).toBe(false);
      expect(retiredRadio.checked).toBe(true);
    });
  });

  describe("Playoff Fields Toggle", () => {
    it("should show playoff fields when toggle is clicked", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Add Playoff Statistics" })).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole("button", { name: "Add Playoff Statistics" });
      await userEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Hide Playoff Statistics" })).toBeInTheDocument();
      });
    });

    it("should show playoff fields in edit mode when player has playoff stats", async () => {
      renderModal({ mode: "edit", player: mockPlayer });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Hide Playoff Statistics" })).toBeInTheDocument();
      });
    });

    it("should hide playoff fields when toggle is clicked twice", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Add Playoff Statistics" })).toBeInTheDocument();
      });

      const addButton = screen.getByRole("button", { name: "Add Playoff Statistics" });
      await userEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Hide Playoff Statistics" })).toBeInTheDocument();
      });

      const hideButton = screen.getByRole("button", { name: "Hide Playoff Statistics" });
      await userEvent.click(hideButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Add Playoff Statistics" })).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation", () => {
    it("should show validation errors for required fields", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Add Player" })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole("button", { name: "Add Player" });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument();
      });
    });

    it("should validate jersey number range", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByLabelText(/Jersey Number/i)).toBeInTheDocument();
      });

      const jerseyInput = screen.getByLabelText(/Jersey Number/i);
      await userEvent.clear(jerseyInput);
      await userEvent.type(jerseyInput, "100");

      const submitButton = screen.getByRole("button", { name: "Add Player" });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Jersey number must be between 0 and 99")
        ).toBeInTheDocument();
      });
    });

    it("should validate weight is positive", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
      });

      const weightInput = screen.getByLabelText(/Weight/i);
      await userEvent.clear(weightInput);
      await userEvent.type(weightInput, "0");

      const submitButton = screen.getByRole("button", { name: "Add Player" });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Weight must be a positive number")
        ).toBeInTheDocument();
      });
    });

    it("should clear validation errors when corrected", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Submit without name to trigger error
      const submitButton = screen.getByRole("button", { name: "Add Player" });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument();
      });

      // Fill in name
      const nameInput = screen.getByLabelText(/Name/i);
      await userEvent.type(nameInput, "Valid Name");

      // Error should clear on next interaction
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit form successfully in add mode", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockPlayer });

      renderModal();

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Fill in all required fields
      await userEvent.type(screen.getByLabelText(/Name/i), "New Player");
      await userEvent.type(screen.getByLabelText(/Jersey Number/i), "10");

      const positionSelect = screen.getByLabelText(/Position/i);
      await userEvent.selectOptions(positionSelect, "C");

      const teamSelect = screen.getByLabelText(/Team/i);
      await userEvent.selectOptions(teamSelect, "1");

      await userEvent.type(screen.getByLabelText(/Nationality/i), "Canada");
      await userEvent.type(screen.getByLabelText(/Birth Date/i), "1990-01-01");
      await userEvent.type(screen.getByLabelText(/Height/i), "6'0\"");
      await userEvent.type(screen.getByLabelText(/Weight/i), "200");

      const rightHandednessRadio = screen.getByLabelText("Right");
      await userEvent.click(rightHandednessRadio);

      const submitButton = screen.getByRole("button", { name: "Add Player" });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining("/players"),
          expect.any(Object)
        );
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("should submit form successfully in edit mode", async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: mockPlayer });

      renderModal({ mode: "edit", player: mockPlayer });

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole("button", { name: "Update Player" });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          expect.stringContaining("/players/1"),
          expect.any(Object)
        );
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("should handle API error during submission", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { detail: "Player already exists" } },
      });

      renderModal();

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Fill in required fields
      await userEvent.type(screen.getByLabelText(/Name/i), "Duplicate");
      await userEvent.type(screen.getByLabelText(/Jersey Number/i), "10");

      const positionSelect = screen.getByLabelText(/Position/i);
      await userEvent.selectOptions(positionSelect, "C");

      const teamSelect = screen.getByLabelText(/Team/i);
      await userEvent.selectOptions(teamSelect, "1");

      await userEvent.type(screen.getByLabelText(/Nationality/i), "Canada");
      await userEvent.type(screen.getByLabelText(/Birth Date/i), "1990-01-01");
      await userEvent.type(screen.getByLabelText(/Height/i), "6'0\"");
      await userEvent.type(screen.getByLabelText(/Weight/i), "200");

      const rightHandednessRadio = screen.getByLabelText("Right");
      await userEvent.click(rightHandednessRadio);

      const submitButton = screen.getByRole("button", { name: "Add Player" });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });

      // Form should remain open (not call onSuccess)
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it("should disable submit button while submitting", async () => {
      mockedAxios.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: mockPlayer }), 100))
      );

      renderModal();

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Fill in all required fields to pass validation
      await userEvent.type(screen.getByLabelText(/Name/i), "Test Player");
      await userEvent.type(screen.getByLabelText(/Jersey Number/i), "10");

      const positionSelect = screen.getByLabelText(/Position/i);
      await userEvent.selectOptions(positionSelect, "C");

      const teamSelect = screen.getByLabelText(/Team/i);
      await userEvent.selectOptions(teamSelect, "1");

      await userEvent.type(screen.getByLabelText(/Nationality/i), "Canada");
      await userEvent.type(screen.getByLabelText(/Birth Date/i), "1990-01-01");
      await userEvent.type(screen.getByLabelText(/Height/i), "6'0\"");
      await userEvent.type(screen.getByLabelText(/Weight/i), "200");

      const rightHandednessRadio = screen.getByLabelText("Right");
      await userEvent.click(rightHandednessRadio);

      const submitButton = screen.getByRole("button", { name: "Add Player" });
      await userEvent.click(submitButton);

      // Button should show submitting state
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Submitting..." })).toBeInTheDocument();
      });
    });
  });

  describe("Modal Close", () => {
    it("should call onClose when cancel button is clicked", async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await userEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should reset form when modal closes and reopens", async () => {
      const { rerender } = renderModal();

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Enter some data
      await userEvent.type(screen.getByLabelText(/Name/i), "Test Name");

      // Close modal
      rerender(
        <ToastProvider>
          <PlayerFormModal
            isOpen={false}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            mode="add"
          />
        </ToastProvider>
      );

      // Reopen modal
      rerender(
        <ToastProvider>
          <PlayerFormModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            mode="add"
          />
        </ToastProvider>
      );

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
        expect(nameInput.value).toBe("");
      });
    });
  });

  describe("Team Loading", () => {
    it("should handle team fetch error gracefully", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Failed to fetch teams"));

      renderModal();

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining("/teams")
        );
      });

      // Form should still render
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });
  });
});
