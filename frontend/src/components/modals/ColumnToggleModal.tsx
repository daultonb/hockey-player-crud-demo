import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import './ColumnToggleModal.css';
import Modal from './Modal';

// Define column configuration interface - matches backend response
export interface ColumnConfig {
  key: string;
  label: string;
  required?: boolean;
  capabilities?: string[];
  field_type?: string;
}

// Fallback columns in case API call fails - minimal set for graceful degradation
const FALLBACK_COLUMNS: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Name',
    required: true,
    capabilities: ['searchable', 'sortable'],
  },
  {
    key: 'jersey_number',
    label: 'Number',
    capabilities: ['searchable', 'sortable', 'filterable'],
  },
  {
    key: 'position',
    label: 'Position',
    capabilities: ['searchable', 'filterable'],
  },
  {
    key: 'team',
    label: 'Team',
    capabilities: ['searchable', 'sortable', 'filterable'],
  },
  { key: 'goals', label: 'Goals', capabilities: ['sortable', 'filterable'] },
  {
    key: 'assists',
    label: 'Assists',
    capabilities: ['sortable', 'filterable'],
  },
  { key: 'points', label: 'Points', capabilities: ['sortable', 'filterable'] },
  {
    key: 'active_status',
    label: 'Status',
    capabilities: ['sortable', 'filterable'],
  },
];

interface ColumnListProps {
  selectedColumns: ColumnConfig[];
  unselectedColumns: ColumnConfig[];
  onColumnChange: (columnKey: string, isChecked: boolean) => void;
  isLoading: boolean;
}

// Separate memoized component for the column list to prevent modal flashing
const ColumnList: React.FC<ColumnListProps> = React.memo(
  ({ selectedColumns, unselectedColumns, onColumnChange, isLoading }) => {
    if (isLoading) {
      return (
        <div className="columns-list-loading">
          <div className="loading-spinner">Loading columns...</div>
        </div>
      );
    }

    return (
      <div className="columns-list">
        {/* First show selected columns in selection order (matching table) */}
        {selectedColumns.map((column: ColumnConfig) => {
          const isDisabled = column.required;
          return (
            <div
              key={column.key}
              className={`column-item ${isDisabled ? 'required' : ''}`}
            >
              <label className="column-checkbox">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={isDisabled}
                  onChange={e => onColumnChange(column.key, e.target.checked)}
                />
                <span className="checkbox-label">
                  <span className="checkbox-label-text">
                    {column.label}
                    {column.required && (
                      <span className="required-indicator"> (Required)</span>
                    )}
                  </span>
                  <span className="column-capabilities">
                    {column.capabilities && column.capabilities.length > 0 ? (
                      <>
                        {column.capabilities.join(', ')}
                        {column.field_type && (
                          <span className="field-type">
                            {' '}
                            • {column.field_type}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        display only
                        {column.field_type && (
                          <span className="field-type">
                            {' '}
                            • {column.field_type}
                          </span>
                        )}
                      </>
                    )}
                  </span>
                </span>
              </label>
            </div>
          );
        })}

        {/* Then show unselected columns in backend canonical order (for easy discovery) */}
        {unselectedColumns.map((column: ColumnConfig) => {
          const isDisabled = column.required;
          return (
            <div
              key={column.key}
              className={`column-item ${isDisabled ? 'required' : ''}`}
            >
              <label className="column-checkbox">
                <input
                  type="checkbox"
                  checked={false}
                  disabled={isDisabled}
                  onChange={e => onColumnChange(column.key, e.target.checked)}
                />
                <span className="checkbox-label">
                  <span className="checkbox-label-text">
                    {column.label}
                    {column.required && (
                      <span className="required-indicator"> (Required)</span>
                    )}
                  </span>
                  <span className="column-capabilities">
                    {column.capabilities && column.capabilities.length > 0 ? (
                      <>
                        {column.capabilities.join(', ')}
                        {column.field_type && (
                          <span className="field-type">
                            {' '}
                            • {column.field_type}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        display only
                        {column.field_type && (
                          <span className="field-type">
                            {' '}
                            • {column.field_type}
                          </span>
                        )}
                      </>
                    )}
                  </span>
                </span>
              </label>
            </div>
          );
        })}
      </div>
    );
  }
);

ColumnList.displayName = 'ColumnList';

interface ColumnToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVisibleColumns: string[];
  onColumnsChange: (columns: string[]) => void;
}

const ColumnToggleModal: React.FC<ColumnToggleModalProps> = React.memo(
  ({ isOpen, onClose, initialVisibleColumns, onColumnsChange }) => {
    const [availableColumns, setAvailableColumns] =
      useState<ColumnConfig[]>(FALLBACK_COLUMNS);
    const [isLoading, setIsLoading] = useState(false);
    const [dataSource, setDataSource] = useState<'fallback' | 'backend'>(
      'fallback'
    );

    // Local state for visible columns - this prevents parent re-renders from affecting the modal
    const [localVisibleColumns, setLocalVisibleColumns] = useState<string[]>(
      initialVisibleColumns
    );

    // Sync local state with parent when modal opens
    useEffect(() => {
      if (isOpen) {
        setLocalVisibleColumns(initialVisibleColumns);
        fetchColumnMetadata();
      }
    }, [isOpen, initialVisibleColumns]);

    const fetchColumnMetadata = async () => {
      setIsLoading(true);
      try {
        const apiBaseUrl =
          process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
        const response = await axios.get(`${apiBaseUrl}/column-metadata`);

        if (
          response.data &&
          response.data.columns &&
          Array.isArray(response.data.columns)
        ) {
          setAvailableColumns(response.data.columns);
          setDataSource('backend');
        } else {
          console.warn('Invalid response format from column-metadata endpoint');
          setDataSource('fallback');
        }
      } catch (error) {
        console.warn(
          'Failed to fetch column metadata from backend, using fallback:',
          error
        );
        setDataSource('fallback');
      } finally {
        setIsLoading(false);
      }
    };

    const handleColumnChange = (columnKey: string, isChecked: boolean) => {
      setLocalVisibleColumns(prev =>
        isChecked ? [...prev, columnKey] : prev.filter(col => col !== columnKey)
      );
    };

    const handleSelectAll = () => {
      const allColumnKeys = availableColumns.map(col => col.key);
      setLocalVisibleColumns(allColumnKeys);
    };

    const handleResetToDefault = () => {
      // Default columns: name, jersey_number, position, team, goals, assists, points, active_status
      const defaultColumns = [
        'name',
        'jersey_number',
        'position',
        'team',
        'goals',
        'assists',
        'points',
        'active_status',
      ];
      setLocalVisibleColumns(defaultColumns);
    };

    const handleApply = () => {
      // Apply changes to table and close modal
      onColumnsChange(localVisibleColumns);
      onClose();
    };

    const handleClose = () => {
      // Apply changes and close modal
      onColumnsChange(localVisibleColumns);
      onClose();
    };

    // Memoize selected columns list to prevent unnecessary re-renders
    const selectedColumnsList = useMemo(
      () =>
        localVisibleColumns
          .map(colKey => availableColumns.find(col => col.key === colKey))
          .filter((column): column is ColumnConfig => column !== undefined),
      [localVisibleColumns, availableColumns]
    );

    // Memoize unselected columns list to prevent unnecessary re-renders
    const unselectedColumnsList = useMemo(
      () =>
        availableColumns.filter(col => !localVisibleColumns.includes(col.key)),
      [localVisibleColumns, availableColumns]
    );

    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Manage Columns">
        <div className="column-toggle-modal">
          <div className="modal-description">
            <p>
              Select which columns to display in the table. Required columns
              cannot be hidden.
            </p>
          </div>

          <div className="modal-counter">
            <p className="column-count">
              {isLoading
                ? 'Loading column information...'
                : `Showing ${localVisibleColumns.length} of ${availableColumns.length} available columns`}
            </p>
          </div>

          <ColumnList
            selectedColumns={selectedColumnsList}
            unselectedColumns={unselectedColumnsList}
            onColumnChange={handleColumnChange}
            isLoading={isLoading}
          />

          <div className="modal-footer">
            <div className="footer-left">
              <button
                type="button"
                className="bulk-action-btn"
                onClick={handleSelectAll}
                disabled={isLoading}
              >
                Show All
              </button>
              <button
                type="button"
                className="bulk-action-btn reset"
                onClick={handleResetToDefault}
                disabled={isLoading}
              >
                Reset
              </button>
            </div>

            <div className="footer-right">
              <button
                type="button"
                className="apply-btn"
                onClick={handleApply}
                disabled={isLoading}
                title="Apply column changes to table"
              >
                Apply
              </button>
            </div>

            {!isLoading && dataSource === 'fallback' && (
              <div className="data-source-indicator">
                Using cached column definitions
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  }
);

ColumnToggleModal.displayName = 'ColumnToggleModal';

export default ColumnToggleModal;
