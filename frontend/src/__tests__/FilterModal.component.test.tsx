import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterModal from '../components/modals/FilterModal';
import { FilterField, FilterOperator, PlayerFilter } from '../types/Player';

// Mock the Modal component to isolate FilterModal testing
jest.mock('../components/modals/Modal', () => {
  return function MockModal({ children, isOpen, title }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal">
        <div data-testid="modal-title">{title}</div>
        {children}
      </div>
    );
  };
});

describe('FilterModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnApplyFilters = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onApplyFilters: mockOnApplyFilters,
    currentFilters: [] as PlayerFilter[],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for controlled/uncontrolled input warnings
    jest.spyOn(console, 'error').mockImplementation(message => {
      // Only suppress the specific controlled/uncontrolled component warnings
      if (
        typeof message === 'string' &&
        (message.includes('changing an uncontrolled input to be controlled') ||
          message.includes('changing a controlled input to be uncontrolled'))
      ) {
        return;
      }
      // Let other errors through for debugging
      console.warn(message);
    });
  });

  afterEach(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  // @component
  describe('Component Rendering', () => {
    /*
     * Tests that the FilterModal renders correctly when open with all basic UI elements
     * Expected: Modal should be visible with title, empty filter row, and action buttons
     */
    test('should render FilterModal when open', () => {
      render(<FilterModal {...defaultProps} />);

      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Filter Players'
      );
      expect(screen.getByText('Select field...')).toBeInTheDocument();
      expect(screen.getByText('+ Add Filter')).toBeInTheDocument();
      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    /*
     * Tests that the FilterModal does not render when closed
     * Expected: Modal should not be present in the DOM
     */
    test('should not render FilterModal when closed', () => {
      render(<FilterModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    /*
     * Tests that the initial empty filter row is rendered with proper structure
     * Expected: One filter row with disabled operator/value inputs and remove button
     */
    test('should render initial empty filter row', () => {
      render(<FilterModal {...defaultProps} />);

      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('Select operator...')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Select field and operator first')
      ).toBeInTheDocument();

      const removeButton = screen.getByLabelText('Remove filter');
      expect(removeButton).toBeDisabled();
    });

    /*
     * Tests that the filter summary shows no filters initially
     * Expected: Summary should indicate no filters are configured
     */
    test('should show no filters message initially', () => {
      render(<FilterModal {...defaultProps} />);

      expect(
        screen.getByText('No filters configured - will show all players')
      ).toBeInTheDocument();
    });
  });

  // @component
  describe('Filter Row Management', () => {
    /*
     * Tests adding additional filter rows to the modal
     * Expected: New filter rows should be added with incremented numbering
     */
    test('should add new filter row when Add Filter button is clicked', async () => {
      render(<FilterModal {...defaultProps} />);

      const addButton = screen.getByText('+ Add Filter');
      await userEvent.click(addButton);

      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.getAllByText('Select field...')).toHaveLength(2);
    });

    /*
     * Tests removing filter rows when there are multiple rows present
     * Expected: Filter row should be removed and remaining rows should maintain proper numbering
     */
    test('should remove filter row when remove button is clicked', async () => {
      render(<FilterModal {...defaultProps} />);

      // Add a second filter row first
      const addButton = screen.getByText('+ Add Filter');
      await userEvent.click(addButton);

      expect(screen.getByText('2.')).toBeInTheDocument();

      // Remove the first filter row
      const removeButtons = screen.getAllByLabelText('Remove filter');
      await userEvent.click(removeButtons[0]);

      expect(screen.queryByText('2.')).not.toBeInTheDocument();
      expect(screen.getByText('1.')).toBeInTheDocument();
    });

    /*
     * Tests that the last remaining filter row cannot be removed
     * Expected: Remove button should be disabled when only one filter row exists
     */
    test('should disable remove button when only one filter row exists', () => {
      render(<FilterModal {...defaultProps} />);

      const removeButton = screen.getByLabelText('Remove filter');
      expect(removeButton).toBeDisabled();
    });

    /*
     * Tests clearing all filter rows and resetting to empty state
     * Expected: All filters should be cleared and one empty filter row should remain
     */
    test('should clear all filters when Clear All button is clicked', async () => {
      render(<FilterModal {...defaultProps} />);

      // Add multiple filter rows and configure one
      const addButton = screen.getByText('+ Add Filter');
      await userEvent.click(addButton);

      // Select a field in the first row using proper selector
      const allComboboxes = screen.getAllByRole('combobox');
      const firstFieldSelect = allComboboxes[0]; // First combobox is field select
      await userEvent.selectOptions(firstFieldSelect, 'position');

      // Clear all filters
      const clearAllButton = screen.getByText('Clear All');
      await userEvent.click(clearAllButton);

      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.queryByText('2.')).not.toBeInTheDocument();
      expect(
        screen.getByText('No filters configured - will show all players')
      ).toBeInTheDocument();
    });
  });

  // @component
  describe('Filter Field Selection', () => {
    /*
     * Tests selecting a filter field and verifying operator options become available
     * Expected: When field is selected, operator dropdown should be enabled with appropriate options
     */
    test('should enable operator dropdown when field is selected', async () => {
      render(<FilterModal {...defaultProps} />);

      // Get field and operator selects by role
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      // Initially operator should be disabled
      expect(operatorSelect).toBeDisabled();

      // Select a field
      await userEvent.selectOptions(fieldSelect, 'position');

      // Operator should now be enabled
      expect(operatorSelect).not.toBeDisabled();
    });

    /*
     * Tests that selecting a field resets operator and value to empty state
     * Expected: When field changes, operator and value should be cleared
     */
    test('should reset operator and value when field changes', async () => {
      render(<FilterModal {...defaultProps} />);

      // Get field and operator selects by role
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      // Select first field
      await userEvent.selectOptions(fieldSelect, 'position');
      await userEvent.selectOptions(operatorSelect, '=');

      // Change field to another option
      await userEvent.selectOptions(fieldSelect, 'team');

      // Operator should be reset to empty value
      expect(operatorSelect).toHaveValue('');
    });

    /*
     * Tests that all available filterable fields are present in the dropdown
     * Expected: All fields from FILTERABLE_FIELDS should be available for selection
     */
    test('should display all available filterable fields', () => {
      render(<FilterModal {...defaultProps} />);

      // Check that common fields are available - using actual display names from DOM output
      expect(screen.getByText('Position')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Jersey #')).toBeInTheDocument();
      expect(screen.getByText('Goals')).toBeInTheDocument();
      expect(screen.getByText('Assists')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  // @component
  describe('Value Input Rendering', () => {
    /*
     * Tests that appropriate input type is rendered based on field data type (text)
     * Expected: Text input should be rendered for string fields
     */
    test('should render text input for string fields', async () => {
      render(<FilterModal {...defaultProps} />);

      // Get field and operator selects by role
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      await userEvent.selectOptions(fieldSelect, 'position');
      await userEvent.selectOptions(operatorSelect, '=');

      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    /*
     * Tests that numeric input is rendered for numeric fields
     * Expected: Number input should be rendered for numeric fields
     */
    test('should render number input for numeric fields', async () => {
      render(<FilterModal {...defaultProps} />);

      // Get field and operator selects by role
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      await userEvent.selectOptions(fieldSelect, 'jersey_number');
      await userEvent.selectOptions(operatorSelect, '=');

      const numberInput = screen.getByPlaceholderText('Enter number...');
      expect(numberInput).toHaveAttribute('type', 'number');
    });

    /*
     * Tests that boolean select dropdown is rendered for boolean fields
     * Expected: Select dropdown with Active/Retired options should be rendered for boolean fields
     */
    test('should render boolean select for boolean fields', async () => {
      render(<FilterModal {...defaultProps} />);

      // Get field and operator selects by role
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      await userEvent.selectOptions(fieldSelect, 'active_status');
      await userEvent.selectOptions(operatorSelect, '=');

      expect(screen.getByText('Select value...')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Retired')).toBeInTheDocument();
    });

    /*
     * Tests that value input is disabled when field or operator is not selected
     * Expected: Value input should be disabled with appropriate placeholder text
     */
    test('should disable value input when field or operator not selected', () => {
      render(<FilterModal {...defaultProps} />);

      const valueInput = screen.getByPlaceholderText(
        'Select field and operator first'
      );
      expect(valueInput).toBeDisabled();
    });
  });

  // @integration
  describe('Filter Validation and Summary', () => {
    /*
     * Tests that filter summary shows correct count when valid filters are configured
     * Expected: Summary should display the number of valid filters ready to apply
     */
    test('should show correct filter count in summary', async () => {
      render(<FilterModal {...defaultProps} />);

      // Initially should show no filters
      expect(
        screen.getByText('No filters configured - will show all players')
      ).toBeInTheDocument();

      // Configure a valid filter
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      await userEvent.selectOptions(fieldSelect, 'position');
      await userEvent.selectOptions(operatorSelect, '=');

      const valueInput = screen.getByPlaceholderText('Enter text...');
      await userEvent.type(valueInput, 'Forward');

      expect(screen.getByText('1 filter ready to apply')).toBeInTheDocument();
    });

    /*
     * Tests that plural form is used correctly in filter summary
     * Expected: Summary should use "filters" (plural) when multiple filters are configured
     */
    test('should use plural form for multiple filters in summary', async () => {
      render(<FilterModal {...defaultProps} />);

      // Add second filter row
      const addButton = screen.getByText('+ Add Filter');
      await userEvent.click(addButton);

      // Get all comboboxes after adding second row
      const allComboboxes = screen.getAllByRole('combobox');

      // Configure first filter (field=0, operator=1)
      await userEvent.selectOptions(allComboboxes[0], 'position');
      await userEvent.selectOptions(allComboboxes[1], '=');

      const firstValueInput =
        screen.getAllByPlaceholderText('Enter text...')[0];
      await userEvent.type(firstValueInput, 'Forward');

      // Configure second filter (field=2, operator=3)
      await userEvent.selectOptions(allComboboxes[2], 'team');
      await userEvent.selectOptions(allComboboxes[3], '=');

      const secondValueInput =
        screen.getAllByPlaceholderText('Enter text...')[1];
      await userEvent.type(secondValueInput, 'Maple Leafs');

      expect(screen.getByText('2 filters ready to apply')).toBeInTheDocument();
    });
  });

  // @integration
  describe('Filter Application', () => {
    /*
     * Tests applying valid filters calls the onApplyFilters callback with correct data
     * Expected: Valid filters should be passed to callback and modal should close
     */
    test('should apply valid filters when Apply Filters button is clicked', async () => {
      render(<FilterModal {...defaultProps} />);

      // Configure a valid filter
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      await userEvent.selectOptions(fieldSelect, 'position');
      await userEvent.selectOptions(operatorSelect, '=');

      const valueInput = screen.getByPlaceholderText('Enter text...');
      await userEvent.type(valueInput, 'Forward');

      // Apply filters
      const applyButton = screen.getByText('Apply Filters');
      await userEvent.click(applyButton);

      expect(mockOnApplyFilters).toHaveBeenCalledWith([
        {
          field: 'position',
          operator: '=',
          value: 'Forward',
        },
      ]);
      expect(mockOnClose).toHaveBeenCalled();
    });

    /*
     * Tests that incomplete filters are not included when applying filters
     * Expected: Only complete, valid filters should be passed to the callback
     */
    test('should only apply complete valid filters', async () => {
      render(<FilterModal {...defaultProps} />);

      // Add multiple filter rows
      const addButton = screen.getByText('+ Add Filter');
      await userEvent.click(addButton);

      // Get all comboboxes after adding second row
      const allComboboxes = screen.getAllByRole('combobox');

      // Configure only the first filter completely (field=0, operator=1)
      await userEvent.selectOptions(allComboboxes[0], 'position');
      await userEvent.selectOptions(allComboboxes[1], '=');

      const valueInput = screen.getByPlaceholderText('Enter text...');
      await userEvent.type(valueInput, 'Forward');

      // Second filter (incomplete - no value) (field=2, operator=3)
      await userEvent.selectOptions(allComboboxes[2], 'team');
      await userEvent.selectOptions(allComboboxes[3], '=');

      // Apply filters
      const applyButton = screen.getByText('Apply Filters');
      await userEvent.click(applyButton);

      expect(mockOnApplyFilters).toHaveBeenCalledWith([
        {
          field: 'position',
          operator: '=',
          value: 'Forward',
        },
      ]);
    });

    /*
     * Tests that empty filters array is passed when no valid filters are configured
     * Expected: Empty array should be passed to callback when no filters are complete
     */
    test('should apply empty array when no valid filters configured', async () => {
      render(<FilterModal {...defaultProps} />);

      // Apply filters without configuring any
      const applyButton = screen.getByText('Apply Filters');
      await userEvent.click(applyButton);

      expect(mockOnApplyFilters).toHaveBeenCalledWith([]);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // @integration
  describe('Current Filters Initialization', () => {
    /*
     * Tests that existing filters are loaded correctly when modal opens
     * Expected: Filter rows should be populated with current filter values and ready to apply
     */
    test('should initialize filter rows with current filters', () => {
      const currentFilters: PlayerFilter[] = [
        {
          field: 'position' as FilterField,
          operator: '=' as FilterOperator,
          value: 'Forward',
        },
        {
          field: 'team' as FilterField,
          operator: '=' as FilterOperator,
          value: 'Maple Leafs',
        },
      ];

      render(<FilterModal {...defaultProps} currentFilters={currentFilters} />);

      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.getByText('2 filters ready to apply')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Forward')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Maple Leafs')).toBeInTheDocument();
    });

    /*
     * Tests that filter rows are re-initialized when modal closes and reopens
     * Expected: Filter rows should reset to current filters on each modal open
     */
    test('should reinitialize filters when modal reopens', () => {
      const currentFilters: PlayerFilter[] = [
        {
          field: 'position' as FilterField,
          operator: '=' as FilterOperator,
          value: 'Center',
        },
      ];

      const { rerender } = render(
        <FilterModal {...defaultProps} isOpen={false} />
      );

      // Reopen with current filters
      rerender(
        <FilterModal {...defaultProps} currentFilters={currentFilters} />
      );

      expect(screen.getByText('1 filter ready to apply')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Center')).toBeInTheDocument();
    });
  });

  // @component
  describe('Modal Actions', () => {
    /*
     * Tests that Cancel button calls onClose callback without applying filters
     * Expected: Modal should close without calling onApplyFilters
     */
    test('should close modal when Cancel button is clicked', async () => {
      render(<FilterModal {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnApplyFilters).not.toHaveBeenCalled();
    });
  });

  // @edge-cases
  describe('Edge Cases and Error Handling', () => {
    /*
     * Tests handling of numeric input with invalid values
     * Expected: Invalid numeric input should be handled gracefully
     */
    test('should handle invalid numeric input gracefully', async () => {
      render(<FilterModal {...defaultProps} />);

      // Get field and operator selects by role
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      await userEvent.selectOptions(fieldSelect, 'jersey_number');
      await userEvent.selectOptions(operatorSelect, '=');

      const numberInput = screen.getByPlaceholderText('Enter number...');
      await userEvent.clear(numberInput);
      await userEvent.type(numberInput, 'invalid');

      // Component should handle gracefully without crashing
      expect(numberInput).toBeInTheDocument();

      const applyButton = screen.getByText('Apply Filters');
      await userEvent.click(applyButton);

      // Should apply empty array since invalid input makes filter invalid
      expect(mockOnApplyFilters).toHaveBeenCalledWith([]);
    });

    /*
     * Tests that filters with empty string values are not considered valid
     * Expected: Filters with empty values should be excluded from valid filters
     */
    test('should not validate filters with empty string values', async () => {
      render(<FilterModal {...defaultProps} />);

      // Get field and operator selects by role
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      await userEvent.selectOptions(fieldSelect, 'position');
      await userEvent.selectOptions(operatorSelect, '=');

      // Leave value empty
      const applyButton = screen.getByText('Apply Filters');
      await userEvent.click(applyButton);

      expect(mockOnApplyFilters).toHaveBeenCalledWith([]);
    });

    /*
     * Tests rapid interaction with multiple filter operations
     * Expected: Component should handle rapid user interactions without errors
     */
    test('should handle rapid filter row operations', async () => {
      render(<FilterModal {...defaultProps} />);

      const addButton = screen.getByText('+ Add Filter');

      // Rapidly add multiple filters
      await userEvent.click(addButton);
      await userEvent.click(addButton);
      await userEvent.click(addButton);

      expect(screen.getByText('4.')).toBeInTheDocument();

      // Rapidly remove filters
      const removeButtons = screen.getAllByLabelText('Remove filter');
      await userEvent.click(removeButtons[0]);
      await userEvent.click(removeButtons[1]);

      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.queryByText('4.')).not.toBeInTheDocument();
    });

    /*
     * Tests handling of boolean filter values correctly
     * Expected: Boolean values should be properly converted and applied
     */
    test('should handle boolean filter values correctly', async () => {
      render(<FilterModal {...defaultProps} />);

      // Get field and operator selects by role
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      await userEvent.selectOptions(fieldSelect, 'active_status');
      await userEvent.selectOptions(operatorSelect, '=');

      // After selecting boolean field and operator, there should be a third select for value
      const updatedComboboxes = screen.getAllByRole('combobox');
      const booleanSelect = updatedComboboxes[2]; // Third combobox is boolean value
      await userEvent.selectOptions(booleanSelect, 'true');

      const applyButton = screen.getByText('Apply Filters');
      await userEvent.click(applyButton);

      expect(mockOnApplyFilters).toHaveBeenCalledWith([
        {
          field: 'active_status',
          operator: '=',
          value: true,
        },
      ]);
    });

    /*
     * Tests handling of zero values in numeric fields
     * Expected: Zero should be considered a valid numeric value
     */
    test('should handle zero values in numeric fields as valid', async () => {
      render(<FilterModal {...defaultProps} />);

      // Get field and operator selects by role
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field
      const operatorSelect = allComboboxes[1]; // Second combobox is operator

      await userEvent.selectOptions(fieldSelect, 'jersey_number');
      await userEvent.selectOptions(operatorSelect, '=');

      const numberInput = screen.getByPlaceholderText('Enter number...');
      await userEvent.clear(numberInput);
      await userEvent.type(numberInput, '0');

      const applyButton = screen.getByText('Apply Filters');
      await userEvent.click(applyButton);

      expect(mockOnApplyFilters).toHaveBeenCalledWith([
        {
          field: 'jersey_number',
          operator: '=',
          value: 0,
        },
      ]);
    });
  });

  // @accessibility
  describe('Accessibility Features', () => {
    /*
     * Tests that remove filter buttons have proper aria-labels for screen readers
     * Expected: Remove buttons should be properly labeled for accessibility
     */
    test('should have proper aria-labels for remove buttons', () => {
      render(<FilterModal {...defaultProps} />);

      const removeButton = screen.getByLabelText('Remove filter');
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveAttribute('aria-label', 'Remove filter');
    });

    /*
     * Tests that form controls are properly accessible
     * Expected: All form inputs should be accessible to screen readers
     */
    test('should have accessible form controls', async () => {
      render(<FilterModal {...defaultProps} />);

      // Field select should be accessible via role - get first combobox specifically
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field select
      expect(fieldSelect).toBeInTheDocument();

      // Configure a filter and check value input accessibility
      await userEvent.selectOptions(fieldSelect, 'position');

      const operatorSelect = allComboboxes[1]; // Second combobox is operator
      await userEvent.selectOptions(operatorSelect, '=');

      const valueInput = screen.getByPlaceholderText('Enter text...');
      expect(valueInput).toBeInTheDocument();
      expect(valueInput).toHaveAttribute('type', 'text');
    });

    /*
     * Tests keyboard navigation support for interactive elements
     * Expected: Users should be able to navigate the form using keyboard only
     */
    test('should support keyboard navigation', async () => {
      render(<FilterModal {...defaultProps} />);

      // Get first combobox specifically to avoid multiple elements error
      const allComboboxes = screen.getAllByRole('combobox');
      const fieldSelect = allComboboxes[0]; // First combobox is field select

      // Focus should be manageable via keyboard
      fieldSelect.focus();
      expect(fieldSelect).toHaveFocus();

      // Buttons should be focusable
      const addButton = screen.getByText('+ Add Filter');
      addButton.focus();
      expect(addButton).toHaveFocus();
    });
  });
});
