import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import PlayerFormModal from "../components/modals/PlayerFormModal";
import { ToastProvider } from "../components/ToastContainer";
import { Player } from "../types/Player";

// Mock axios
jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock toast
const mockShowToast = jest.fn();
jest.mock("../components/ToastContainer", () => ({
  ...jest.requireActual("../components/ToastContainer"),
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockTeams = [
  { id: 1, name: "Team A", city: "City A" },
  { id: 2, name: "Team B", city: "City B" },
];

const mockPlayer: Player = {
  id: 1,
  name: "Test Player",
  jersey_number: 10,
  position: "C",
  team: { id: 1, name: "Team A", city: "City A" },
  nationality: "Canadian",
  birth_date: "1990-01-01",
  height: '6\'0"',
  weight: 200,
  handedness: "L",
  active_status: true,
  regular_season_games_played: 82,
  regular_season_goals: 30,
  regular_season_assists: 40,
  regular_season_points: 70,
  playoff_games_played: 10,
  playoff_goals: 5,
  playoff_assists: 8,
  playoff_points: 13,
  games_played: 92,
  goals: 35,
  assists: 48,
  points: 83,
};

describe("PlayerFormModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockTeams });
  });

  const renderModal = (props: {
    isOpen: boolean;
    mode: "add" | "edit";
    player?: Player;
  }) => {
    return render(
      <ToastProvider>
        <PlayerFormModal
          isOpen={props.isOpen}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode={props.mode}
          player={props.player}
        />
      </ToastProvider>
    );
  };

  describe("Add Mode", () => {
    it("should render add player modal with empty form", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByText("Add New Player")).toBeInTheDocument();
      });

      // Check form fields are empty
      expect(screen.getByLabelText(/Name/i)).toHaveValue("");
      expect(screen.getByLabelText(/Jersey Number/i)).toHaveValue("");
    });

    it("should fetch teams when modal opens", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining("/teams")
        );
      });
    });

    it("should show error toast if teams fetch fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Failed to fetch"));

      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "Failed to load teams",
          "error"
        );
      });
    });

    it("should validate required fields on submit", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByText("Add New Player")).toBeInTheDocument();
      });

      // Click submit without filling form
      const submitButton = screen.getByRole("button", { name: /Add Player/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument();
        expect(
          screen.getByText("Jersey number must be between 0 and 99")
        ).toBeInTheDocument();
        expect(screen.getByText("Position is required")).toBeInTheDocument();
        expect(screen.getByText("Team is required")).toBeInTheDocument();
        expect(
          screen.getByText("Nationality is required")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Birth date is required")
        ).toBeInTheDocument();
        expect(screen.getByText("Height is required")).toBeInTheDocument();
        expect(
          screen.getByText("Weight must be a positive number")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Handedness is required")
        ).toBeInTheDocument();
      });
    });

    it("should validate jersey number range", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByLabelText(/Jersey Number/i)).toBeInTheDocument();
      });

      const jerseyInput = screen.getByLabelText(/Jersey Number/i);

      // Test too high
      fireEvent.change(jerseyInput, { target: { value: "100" } });
      const submitButton = screen.getByRole("button", { name: /Add Player/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Jersey number must be between 0 and 99")
        ).toBeInTheDocument();
      });

      // Test negative
      fireEvent.change(jerseyInput, { target: { value: "-1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Jersey number must be between 0 and 99")
        ).toBeInTheDocument();
      });
    });

    it("should validate weight is positive", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
      });

      const weightInput = screen.getByLabelText(/Weight/i);
      fireEvent.change(weightInput, { target: { value: "0" } });

      const submitButton = screen.getByRole("button", { name: /Add Player/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Weight must be a positive number")
        ).toBeInTheDocument();
      });
    });

    it("should validate stat fields are non-negative", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(
          screen.getByLabelText(/Regular Season Games Played/i)
        ).toBeInTheDocument();
      });

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText(/Jersey Number/i), {
        target: { value: "10" },
      });

      // Set negative stats
      fireEvent.change(
        screen.getByLabelText(/Regular Season Games Played/i),
        { target: { value: "-1" } }
      );

      const submitButton = screen.getByRole("button", { name: /Add Player/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Must be a non-negative number")
        ).toBeInTheDocument();
      });
    });

    it("should successfully submit add form with valid data", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockPlayer });

      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: "New Player" },
      });
      fireEvent.change(screen.getByLabelText(/Jersey Number/i), {
        target: { value: "15" },
      });
      fireEvent.change(screen.getByLabelText(/Position/i), {
        target: { value: "C" },
      });
      fireEvent.change(screen.getByLabelText(/Team/i), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText(/Nationality/i), {
        target: { value: "American" },
      });
      fireEvent.change(screen.getByLabelText(/Birth Date/i), {
        target: { value: "1995-05-15" },
      });
      fireEvent.change(screen.getByLabelText(/Height/i), {
        target: { value: '6\'2"' },
      });
      fireEvent.change(screen.getByLabelText(/Weight/i), {
        target: { value: "195" },
      });
      fireEvent.change(screen.getByLabelText(/Handedness/i), {
        target: { value: "R" },
      });

      const submitButton = screen.getByRole("button", { name: /Add Player/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining("/players"),
          expect.objectContaining({
            name: "New Player",
            jersey_number: 15,
          })
        );
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith(
          "Player added successfully!",
          "success"
        );
      });
    });

    it("should handle API error on submit", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { detail: "Team not found" } },
      });

      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Fill form
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: "New Player" },
      });
      fireEvent.change(screen.getByLabelText(/Jersey Number/i), {
        target: { value: "15" },
      });
      fireEvent.change(screen.getByLabelText(/Position/i), {
        target: { value: "C" },
      });
      fireEvent.change(screen.getByLabelText(/Team/i), {
        target: { value: "999" },
      });
      fireEvent.change(screen.getByLabelText(/Nationality/i), {
        target: { value: "American" },
      });
      fireEvent.change(screen.getByLabelText(/Birth Date/i), {
        target: { value: "1995-05-15" },
      });
      fireEvent.change(screen.getByLabelText(/Height/i), {
        target: { value: '6\'2"' },
      });
      fireEvent.change(screen.getByLabelText(/Weight/i), {
        target: { value: "195" },
      });
      fireEvent.change(screen.getByLabelText(/Handedness/i), {
        target: { value: "R" },
      });

      const submitButton = screen.getByRole("button", { name: /Add Player/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "Team not found",
          "error"
        );
      });
    });
  });

  describe("Edit Mode", () => {
    it("should render edit player modal with player data", async () => {
      renderModal({ isOpen: true, mode: "edit", player: mockPlayer });

      await waitFor(() => {
        expect(screen.getByText("Edit Player")).toBeInTheDocument();
      });

      // Check form fields are populated
      expect(screen.getByLabelText(/Name/i)).toHaveValue("Test Player");
      expect(screen.getByLabelText(/Jersey Number/i)).toHaveValue("10");
      expect(screen.getByLabelText(/Position/i)).toHaveValue("C");
    });

    it("should successfully submit edit form", async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: mockPlayer });

      renderModal({ isOpen: true, mode: "edit", player: mockPlayer });

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Change a field
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: "Updated Player" },
      });

      const submitButton = screen.getByRole("button", {
        name: /Update Player/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          expect.stringContaining("/players/1"),
          expect.objectContaining({
            name: "Updated Player",
          })
        );
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith(
          "Player updated successfully!",
          "success"
        );
      });
    });
  });

  describe("Playoff Fields", () => {
    it("should toggle playoff fields visibility", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByText("Add New Player")).toBeInTheDocument();
      });

      // Playoff fields should not be visible initially
      expect(
        screen.queryByLabelText(/Playoff Games Played/i)
      ).not.toBeInTheDocument();

      // Click toggle
      const toggleButton = screen.getByRole("button", {
        name: /Show Playoff Stats/i,
      });
      fireEvent.click(toggleButton);

      // Playoff fields should now be visible
      await waitFor(() => {
        expect(
          screen.getByLabelText(/Playoff Games Played/i)
        ).toBeInTheDocument();
      });

      // Toggle back
      const hideButton = screen.getByRole("button", {
        name: /Hide Playoff Stats/i,
      });
      fireEvent.click(hideButton);

      await waitFor(() => {
        expect(
          screen.queryByLabelText(/Playoff Games Played/i)
        ).not.toBeInTheDocument();
      });
    });

    it("should validate playoff stats when visible", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByText("Add New Player")).toBeInTheDocument();
      });

      // Show playoff fields
      const toggleButton = screen.getByRole("button", {
        name: /Show Playoff Stats/i,
      });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(
          screen.getByLabelText(/Playoff Games Played/i)
        ).toBeInTheDocument();
      });

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText(/Jersey Number/i), {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByLabelText(/Position/i), {
        target: { value: "C" },
      });
      fireEvent.change(screen.getByLabelText(/Team/i), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText(/Nationality/i), {
        target: { value: "Canadian" },
      });
      fireEvent.change(screen.getByLabelText(/Birth Date/i), {
        target: { value: "1990-01-01" },
      });
      fireEvent.change(screen.getByLabelText(/Height/i), {
        target: { value: '6\'0"' },
      });
      fireEvent.change(screen.getByLabelText(/Weight/i), {
        target: { value: "200" },
      });
      fireEvent.change(screen.getByLabelText(/Handedness/i), {
        target: { value: "L" },
      });

      // Set negative playoff stats
      fireEvent.change(screen.getByLabelText(/Playoff Games Played/i), {
        target: { value: "-5" },
      });

      const submitButton = screen.getByRole("button", { name: /Add Player/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errors = screen.getAllByText("Must be a non-negative number");
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Input Handling", () => {
    it("should clear field errors when user types", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Submit to trigger errors
      const submitButton = screen.getByRole("button", { name: /Add Player/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument();
      });

      // Type in name field
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: "Test Name" },
      });

      // Error should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText("Name is required")
        ).not.toBeInTheDocument();
      });
    });

    it("should handle checkbox changes", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByLabelText(/Active/i)).toBeInTheDocument();
      });

      const activeCheckbox = screen.getByLabelText(/Active/i) as HTMLInputElement;

      // Should be checked by default
      expect(activeCheckbox.checked).toBe(true);

      // Toggle it
      fireEvent.click(activeCheckbox);

      await waitFor(() => {
        expect(activeCheckbox.checked).toBe(false);
      });
    });
  });

  describe("Modal Close", () => {
    it("should call onClose when cancel is clicked", async () => {
      renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should reset form when reopened", async () => {
      const { rerender } = renderModal({ isOpen: true, mode: "add" });

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Fill in a field
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: "Test Name" },
      });

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
        expect(screen.getByLabelText(/Name/i)).toHaveValue("");
      });
    });
  });
});
