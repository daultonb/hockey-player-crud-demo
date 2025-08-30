import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerDetailsModal from '../components/players/PlayerDetailsModal';
import { Player } from '../types/Player';

// Mock the Modal component since it's already tested separately
jest.mock('../components/modals/Modal', () => {
  return function MockModal({
    isOpen,
    onClose,
    children,
    title,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal">
        <div data-testid="modal-title">{title}</div>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        <div data-testid="modal-content">{children}</div>
      </div>
    );
  };
});

// Mock player data
const mockActivePlayer: Player = {
  id: 1,
  name: 'Connor McDavid',
  position: 'Center',
  nationality: 'Canadian',
  jersey_number: 97,
  birth_date: '1997-01-13',
  height: '6\'1"',
  weight: 193,
  handedness: 'Left',
  goals: 42,
  assists: 75,
  points: 117,
  active_status: true,
  team: {
    id: 1,
    name: 'Oilers',
    city: 'Edmonton',
  },
};

const mockRetiredPlayer: Player = {
  id: 2,
  name: 'Wayne Gretzky',
  position: 'Center',
  nationality: 'Canadian',
  jersey_number: 99,
  birth_date: '1961-01-26',
  height: '6\'0"',
  weight: 185,
  handedness: 'Left',
  goals: 894,
  assists: 1963,
  points: 2857,
  active_status: false,
  team: {
    id: 2,
    name: 'Rangers',
    city: 'New York',
  },
};

const mockPlayerWithInvalidDate: Player = {
  ...mockActivePlayer,
  birth_date: 'invalid-date',
};

describe('PlayerDetailsModal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('@component Basic Rendering', () => {
    /*
     * Tests that the modal returns null when player is null
     * Expected: No modal elements are rendered
     */
    test('returns null when player is null', () => {
      render(
        <PlayerDetailsModal player={null} isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    /*
     * Tests that the modal is not visible when isOpen is false
     * Expected: Modal is not in the document
     */
    test('does not render when isOpen is false', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    /*
     * Tests that the modal renders with player data when open
     * Expected: Modal displays with correct title
     */
    test('renders modal when isOpen is true and player is provided', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Connor McDavid - #97'
      );
    });
  });

  describe('@component Player Information Display', () => {
    /*
     * Tests that all player details are displayed correctly
     * Expected: All player information fields are shown with correct values
     */
    test('displays all player details correctly', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Check section headers
      expect(screen.getByText('Player Details')).toBeInTheDocument();
      expect(screen.getByText('Statistics')).toBeInTheDocument();

      // Check player info
      expect(screen.getByText('Position:')).toBeInTheDocument();
      expect(screen.getByText('Center')).toBeInTheDocument();

      expect(screen.getByText('Team:')).toBeInTheDocument();
      expect(screen.getByText('Edmonton Oilers')).toBeInTheDocument();

      expect(screen.getByText('Nationality:')).toBeInTheDocument();
      expect(screen.getByText('Canadian')).toBeInTheDocument();

      expect(screen.getByText('Jersey Number:')).toBeInTheDocument();
      expect(screen.getByText('#97')).toBeInTheDocument();

      expect(screen.getByText('Height:')).toBeInTheDocument();
      expect(screen.getByText('6\'1"')).toBeInTheDocument();

      expect(screen.getByText('Weight:')).toBeInTheDocument();
      expect(screen.getByText('193 lbs')).toBeInTheDocument();

      expect(screen.getByText('Handedness:')).toBeInTheDocument();
      expect(screen.getByText('Left')).toBeInTheDocument();
    });

    /*
     * Tests that statistics are displayed correctly
     * Expected: Goals, assists, and points are shown with correct values
     */
    test('displays player statistics correctly', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Check statistics
      expect(screen.getByText('Goals')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();

      expect(screen.getByText('Assists')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();

      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('117')).toBeInTheDocument();
    });

    /*
     * Tests that birth date is formatted correctly
     * Expected: Date is displayed in formatted manner
     */
    test('formats birth date correctly', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Birth Date:')).toBeInTheDocument();
      // The date format may vary by timezone, so we verify the structure exists
      // rather than the exact date string
      const modalContent = screen.getByTestId('modal-content');
      expect(modalContent.textContent).toContain('Birth Date:');
      expect(modalContent.textContent).toMatch(/1997/); // Year should be present
    });

    /*
     * Tests active player status display
     * Expected: Shows "Active" with active styling class
     */
    test('displays active status correctly', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Status:')).toBeInTheDocument();
      const statusElement = screen.getByText('Active');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('info-value', 'status', 'active');
    });

    /*
     * Tests retired player status display
     * Expected: Shows "Retired" with retired styling class
     */
    test('displays retired status correctly', () => {
      render(
        <PlayerDetailsModal
          player={mockRetiredPlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const statusElement = screen.getByText('Retired');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('info-value', 'status', 'retired');
    });
  });

  describe('@component Date Formatting', () => {
    /*
     * Tests date formatting with valid date string
     * Expected: Formats date to locale string format
     */
    test('formats valid date correctly', () => {
      render(
        <PlayerDetailsModal
          player={mockRetiredPlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Verify that Birth Date label exists and a formatted date is shown
      expect(screen.getByText('Birth Date:')).toBeInTheDocument();

      // The actual date shown may vary by timezone, so just verify it contains year 1961
      const allText = screen.getByTestId('modal-content').textContent;
      expect(allText).toMatch(/1961/);
    });

    /*
     * Tests handling of invalid date format
     * Expected: Shows "Invalid Date" when date parsing fails
     */
    test('handles invalid date format gracefully', () => {
      render(
        <PlayerDetailsModal
          player={mockPlayerWithInvalidDate}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // When date is invalid, JavaScript's Date constructor returns "Invalid Date"
      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });

    /*
     * Tests date formatting with different date formats
     * Expected: Correctly formats various ISO date strings
     */
    test('formats different date formats correctly', () => {
      const playerWithDifferentDate: Player = {
        ...mockActivePlayer,
        birth_date: '2000-12-25',
      };

      render(
        <PlayerDetailsModal
          player={playerWithDifferentDate}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Verify the year 2000 appears in the formatted date
      const allText = screen.getByTestId('modal-content').textContent;
      expect(allText).toMatch(/2000/);
    });
  });

  describe('@integration Modal Integration', () => {
    /*
     * Tests that modal receives correct props
     * Expected: Modal component receives isOpen, onClose, and title props
     */
    test('passes correct props to Modal component', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Connor McDavid - #97'
      );
    });

    /*
     * Tests that onClose is called when modal close button is clicked
     * Expected: onClose callback is triggered
     */
    test('calls onClose when modal close button is clicked', async () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByTestId('modal-close');
      await userEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('@component Content Structure', () => {
    /*
     * Tests that content is organized in correct sections
     * Expected: Player details and statistics sections are present
     */
    test('organizes content in proper sections', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Check for section structure
      const sections = screen.getAllByRole('heading', { level: 3 });
      expect(sections).toHaveLength(2);
      expect(sections[0]).toHaveTextContent('Player Details');
      expect(sections[1]).toHaveTextContent('Statistics');
    });

    /*
     * Tests that all required info items are present
     * Expected: All 9 info items are displayed
     */
    test('displays all required info items', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const infoLabels = [
        'Position:',
        'Team:',
        'Nationality:',
        'Jersey Number:',
        'Birth Date:',
        'Height:',
        'Weight:',
        'Handedness:',
        'Status:',
      ];

      infoLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    /*
     * Tests that all statistics items are present
     * Expected: Goals, Assists, and Points are displayed
     */
    test('displays all statistics items', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const statLabels = ['Goals', 'Assists', 'Points'];

      statLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('@accessibility Accessibility Features', () => {
    /*
     * Tests that modal has proper semantic structure
     * Expected: Headings and sections provide proper document structure
     */
    test('has proper semantic structure with headings', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Check that headings have appropriate text
      const headingTexts = headings.map(h => h.textContent);
      expect(headingTexts).toContain('Player Details');
      expect(headingTexts).toContain('Statistics');
    });

    /*
     * Tests that content uses proper labeling for accessibility
     * Expected: All information is properly labeled and readable
     */
    test('provides clear labels for all information', () => {
      render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Verify all labels are present and associated with values
      const labels = [
        'Position:',
        'Team:',
        'Nationality:',
        'Jersey Number:',
        'Birth Date:',
        'Height:',
        'Weight:',
        'Handedness:',
        'Status:',
      ];

      labels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });

      // Verify statistics labels
      expect(screen.getByText('Goals')).toBeInTheDocument();
      expect(screen.getByText('Assists')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
    });
  });

  describe('@edge-cases Edge Cases', () => {
    /*
     * Tests handling of player with zero statistics
     * Expected: Displays "0" for all statistics
     */
    test('handles player with zero statistics', () => {
      const playerWithZeroStats: Player = {
        ...mockActivePlayer,
        goals: 0,
        assists: 0,
        points: 0,
      };

      render(
        <PlayerDetailsModal
          player={playerWithZeroStats}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Find all elements with "0" text - should be exactly 3 (goals, assists, points)
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3);
    });

    /*
     * Tests handling of player with very long name
     * Expected: Long name is displayed in title
     */
    test('handles player with very long name', () => {
      const playerWithLongName: Player = {
        ...mockActivePlayer,
        name: 'Jean-Baptiste Extraordinaire De La Rochefoucauld-Liancourt III',
      };

      render(
        <PlayerDetailsModal
          player={playerWithLongName}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Jean-Baptiste Extraordinaire De La Rochefoucauld-Liancourt III - #97'
      );
    });

    /*
     * Tests handling of player with special characters in data
     * Expected: Special characters are displayed correctly
     */
    test('handles special characters in player data', () => {
      const playerWithSpecialChars: Player = {
        ...mockActivePlayer,
        team: {
          id: 3,
          name: 'Canadiens',
          city: 'Montréal',
        },
        nationality: "Côte d'Ivoire",
      };

      render(
        <PlayerDetailsModal
          player={playerWithSpecialChars}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Montréal Canadiens')).toBeInTheDocument();
      expect(screen.getByText("Côte d'Ivoire")).toBeInTheDocument();
    });

    /*
     * Tests rapid open/close state changes
     * Expected: Modal responds correctly to prop changes
     */
    test('handles rapid open/close state changes', () => {
      const { rerender } = render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();

      rerender(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

      rerender(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    /*
     * Tests changing player while modal is open
     * Expected: Modal updates to show new player data
     */
    test('updates content when player prop changes', () => {
      const { rerender } = render(
        <PlayerDetailsModal
          player={mockActivePlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Connor McDavid - #97'
      );

      rerender(
        <PlayerDetailsModal
          player={mockRetiredPlayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Wayne Gretzky - #99'
      );
    });

    /*
     * Tests handling of very large statistics numbers
     * Expected: Large numbers are displayed correctly
     */
    test('handles large statistics numbers', () => {
      const playerWithLargeStats: Player = {
        ...mockActivePlayer,
        goals: 99999,
        assists: 88888,
        points: 188887,
      };

      render(
        <PlayerDetailsModal
          player={playerWithLargeStats}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('99999')).toBeInTheDocument();
      expect(screen.getByText('88888')).toBeInTheDocument();
      expect(screen.getByText('188887')).toBeInTheDocument();
    });
  });
});
