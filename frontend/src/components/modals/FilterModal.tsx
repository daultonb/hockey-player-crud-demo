import React, { useEffect, useState } from 'react';
import {
  BOOLEAN_OPTIONS,
  FILTERABLE_FIELDS,
  FilterDataType,
  FilterField,
  FilterOperator,
  OPERATOR_LABELS,
  PlayerFilter,
} from '../../types/Player';
import './FilterModal.css';
import Modal from './Modal';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: PlayerFilter[]) => void;
  currentFilters: PlayerFilter[];
}

interface FilterRow {
  id: string;
  field: FilterField | '';
  operator: FilterOperator | '';
  value: string | number | boolean;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filterRows, setFilterRows] = useState<FilterRow[]>([]);

  // Initialize filter rows when modal opens or current filters change
  useEffect(() => {
    if (isOpen) {
      if (currentFilters.length > 0) {
        const rows = currentFilters.map((filter, index) => ({
          id: `filter-${index}`,
          field: filter.field,
          operator: filter.operator,
          value: filter.value,
        }));
        setFilterRows(rows);
      } else {
        // Start with one empty filter row
        setFilterRows([createEmptyFilterRow()]);
      }
    }
  }, [isOpen, currentFilters]);

  const createEmptyFilterRow = (): FilterRow => ({
    id: `filter-${Date.now()}-${Math.random()}`,
    field: '',
    operator: '',
    value: '',
  });

  const getFieldConfig = (field: FilterField) => {
    return FILTERABLE_FIELDS.find(f => f.field === field);
  };

  const getAvailableOperators = (field: FilterField): FilterOperator[] => {
    const config = getFieldConfig(field);
    return config ? config.operators : [];
  };

  const getFieldDataType = (field: FilterField): FilterDataType => {
    const config = getFieldConfig(field);
    return config ? config.dataType : 'string';
  };

  const handleFieldChange = (id: string, field: FilterField | '') => {
    setFilterRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, field, operator: '', value: '' } : row
      )
    );
  };

  const handleOperatorChange = (id: string, operator: FilterOperator | '') => {
    setFilterRows(prev =>
      prev.map(row => (row.id === id ? { ...row, operator, value: '' } : row))
    );
  };

  const handleValueChange = (id: string, value: string | number | boolean) => {
    setFilterRows(prev =>
      prev.map(row => (row.id === id ? { ...row, value } : row))
    );
  };

  const addFilterRow = () => {
    setFilterRows(prev => [...prev, createEmptyFilterRow()]);
  };

  const removeFilterRow = (id: string) => {
    setFilterRows(prev => {
      const filtered = prev.filter(row => row.id !== id);
      // Ensure at least one filter row remains
      return filtered.length === 0 ? [createEmptyFilterRow()] : filtered;
    });
  };

  const clearAllFilters = () => {
    setFilterRows([createEmptyFilterRow()]);
  };

  const validateFilter = (
    row: FilterRow
  ): row is FilterRow & { field: FilterField; operator: FilterOperator } => {
    return !!(
      row.field &&
      row.operator &&
      row.value !== '' &&
      row.value !== null &&
      row.value !== undefined
    );
  };

  const applyFilters = () => {
    const validFilters: PlayerFilter[] = filterRows
      .filter(validateFilter)
      .map(row => ({
        field: row.field,
        operator: row.operator,
        value: row.value,
      }));

    onApplyFilters(validFilters);
    onClose();
  };

  const renderValueInput = (row: FilterRow) => {
    if (!row.field || !row.operator) {
      return (
        <input
          type="text"
          className="filter-value-input"
          disabled
          placeholder="Select field and operator first"
        />
      );
    }

    const dataType = getFieldDataType(row.field);

    if (dataType === 'boolean') {
      return (
        <select
          className="filter-value-select"
          value={row.value.toString()}
          onChange={e => handleValueChange(row.id, e.target.value === 'true')}
        >
          <option value="">Select value...</option>
          {BOOLEAN_OPTIONS.map(option => (
            <option
              key={option.value.toString()}
              value={option.value.toString()}
            >
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (dataType === 'numeric') {
      return (
        <input
          type="number"
          className="filter-value-input"
          value={row.value.toString()}
          onChange={e =>
            handleValueChange(row.id, parseInt(e.target.value) || 0)
          }
          placeholder="Enter number..."
        />
      );
    }

    return (
      <input
        type="text"
        className="filter-value-input"
        value={row.value.toString()}
        onChange={e => handleValueChange(row.id, e.target.value)}
        placeholder="Enter text..."
      />
    );
  };

  const validFilterCount = filterRows.filter(validateFilter).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Players">
      <div className="filter-modal-content">
        <div className="filter-rows">
          {filterRows.map((row, index) => (
            <div key={row.id} className="filter-row">
              <div className="filter-row-number">{index + 1}.</div>

              <select
                className="filter-field-select"
                value={row.field}
                onChange={e =>
                  handleFieldChange(row.id, e.target.value as FilterField)
                }
              >
                <option value="">Select field...</option>
                {FILTERABLE_FIELDS.map(field => (
                  <option key={field.field} value={field.field}>
                    {field.displayName}
                  </option>
                ))}
              </select>

              <select
                className="filter-operator-select"
                value={row.operator}
                onChange={e =>
                  handleOperatorChange(row.id, e.target.value as FilterOperator)
                }
                disabled={!row.field}
              >
                <option value="">Select operator...</option>
                {row.field &&
                  getAvailableOperators(row.field).map(operator => (
                    <option key={operator} value={operator}>
                      {OPERATOR_LABELS[operator]}
                    </option>
                  ))}
              </select>

              {renderValueInput(row)}

              <button
                type="button"
                className="remove-filter-btn"
                onClick={() => removeFilterRow(row.id)}
                disabled={filterRows.length === 1}
                aria-label="Remove filter"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className="add-filter-btn"
            onClick={addFilterRow}
          >
            + Add Filter
          </button>
        </div>

        <div className="filter-summary">
          {validFilterCount > 0 ? (
            <p>
              {validFilterCount} filter
              {validFilterCount === 1 ? '' : 's'} ready to apply
            </p>
          ) : (
            <p className="no-filters">
              No filters configured - will show all players
            </p>
          )}
        </div>

        <div className="filter-modal-buttons">
          <button
            type="button"
            className="clear-all-btn"
            onClick={clearAllFilters}
          >
            Clear All
          </button>
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="apply-btn" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;
