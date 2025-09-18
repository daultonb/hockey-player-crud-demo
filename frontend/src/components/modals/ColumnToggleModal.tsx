import axios from 'axios';
import React, { useEffect, useState } from 'react';
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

interface ColumnToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleColumns: string[];
  onColumnToggle: (columnKey: string, isVisible: boolean) => void;
}

const ColumnToggleModal: React.FC<ColumnToggleModalProps> = ({
  isOpen,
  onClose,
  visibleColumns,
  onColumnToggle,
}) => {
  const [availableColumns, setAvailableColumns] =
    useState<ColumnConfig[]>(FALLBACK_COLUMNS);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'fallback' | 'backend'>(
    'fallback'
  );

  // Fetch column metadata from backend when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchColumnMetadata();
    }
  }, [isOpen]);

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
        console.log(
          'Successfully fetched column metadata from backend:',
          response.data.columns
        );
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
    onColumnToggle(columnKey, isChecked);
  };

  const handleSelectAll = () => {
    availableColumns.forEach(column => {
      if (!visibleColumns.includes(column.key)) {
        onColumnToggle(column.key, true);
      }
    });
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

    availableColumns.forEach(column => {
      const shouldBeVisible = defaultColumns.includes(column.key);
      const isCurrentlyVisible = visibleColumns.includes(column.key);

      if (shouldBeVisible !== isCurrentlyVisible) {
        onColumnToggle(column.key, shouldBeVisible);
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Columns">
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
              : `Showing ${visibleColumns.length} of ${availableColumns.length} available columns`}
          </p>
        </div>

        <div className="columns-list">
          {availableColumns.map((column: ColumnConfig) => {
            const isVisible = visibleColumns.includes(column.key);
            const isDisabled = column.required;

            return (
              <div
                key={column.key}
                className={`column-item ${isDisabled ? 'required' : ''}`}
              >
                <label className="column-checkbox">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    disabled={isDisabled}
                    onChange={e =>
                      handleColumnChange(column.key, e.target.checked)
                    }
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

        <div className="modal-footer">
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

          {!isLoading && dataSource === 'fallback' && (
            <div className="data-source-indicator">
              Using cached column definitions
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ColumnToggleModal;
