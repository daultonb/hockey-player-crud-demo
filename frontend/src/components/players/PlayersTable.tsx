import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Player,
  PlayerFilter,
  PlayersApiResponse,
  SearchField,
  SortDirection,
  SortField,
} from '../../types/Player';
import ColumnToggleModal from '../modals/ColumnToggleModal';
import FilterModal from '../modals/FilterModal';
import PaginationControls from './PaginationControls';
import './PaginationControls.css';
import PlayerDetailsModal from './PlayerDetailsModal';
import PlayerSearch from './PlayerSearch';
import './PlayersTable.css';

const PlayersTable: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Search and pagination state
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [currentSearchField, setCurrentSearchField] =
    useState<SearchField>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Sort state - default to name ascending
  const [currentSortField, setCurrentSortField] = useState<SortField>('name');
  const [currentSortDirection, setCurrentSortDirection] =
    useState<SortDirection>('asc');

  // Filter state
  const [currentFilters, setCurrentFilters] = useState<PlayerFilter[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Column visibility state
  const [isColumnModalOpen, setIsColumnModalOpen] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name',
    'jersey_number',
    'position',
    'team',
    'goals',
    'assists',
    'points',
    'active_status',
  ]);

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

  const fetchPlayers = useCallback(
    async (
      search?: string,
      searchField?: SearchField,
      page?: number,
      limit?: number,
      sortBy?: SortField,
      sortOrder?: SortDirection,
      filters?: PlayerFilter[],
      isSearch?: boolean
    ) => {
      try {
        if (isSearch) {
          setSearchLoading(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params = new URLSearchParams({
          page: String(page || currentPage),
          limit: String(limit || itemsPerPage),
          sort_by: sortBy || currentSortField,
          sort_order: sortOrder || currentSortDirection,
        });

        if (search !== undefined && search.trim()) {
          params.append('search', search.trim());
        }

        if (searchField !== undefined) {
          params.append('field', searchField);
        }

        if (filters && filters.length > 0) {
          params.append('filters', JSON.stringify(filters));
        }

        const response = await axios.get<PlayersApiResponse>(
          `${apiBaseUrl}/players?${params}`
        );

        setPlayers(response.data.players);
        setTotalCount(response.data.total);
        setTotalPages(response.data.total_pages);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Failed to fetch players. Please try again later.');
        setPlayers([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [
      currentPage,
      itemsPerPage,
      currentSortField,
      currentSortDirection,
      apiBaseUrl,
    ]
  );

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleSearch = useCallback(
    (search: string, field: SearchField) => {
      setCurrentSearch(search);
      setCurrentSearchField(field);
      setCurrentPage(1);

      fetchPlayers(
        search,
        field,
        1,
        itemsPerPage,
        currentSortField,
        currentSortDirection,
        currentFilters,
        true
      );
    },
    [
      fetchPlayers,
      itemsPerPage,
      currentSortField,
      currentSortDirection,
      currentFilters,
    ]
  );

  const handleSort = useCallback(
    (field: SortField) => {
      let newDirection: SortDirection = 'asc';

      if (currentSortField === field) {
        newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      }

      setCurrentSortField(field);
      setCurrentSortDirection(newDirection);
      setCurrentPage(1);

      fetchPlayers(
        currentSearch,
        currentSearchField,
        1,
        itemsPerPage,
        field,
        newDirection,
        currentFilters,
        true
      );
    },
    [
      fetchPlayers,
      currentSearch,
      currentSearchField,
      itemsPerPage,
      currentSortField,
      currentSortDirection,
      currentFilters,
    ]
  );

  const handleOpenFilters = useCallback(() => {
    setIsFilterModalOpen(true);
  }, []);

  const handleCloseFilters = useCallback(() => {
    setIsFilterModalOpen(false);
  }, []);

  const handleApplyFilters = useCallback(
    (filters: PlayerFilter[]) => {
      setCurrentFilters(filters);
      setCurrentPage(1);

      fetchPlayers(
        currentSearch,
        currentSearchField,
        1,
        itemsPerPage,
        currentSortField,
        currentSortDirection,
        filters,
        true
      );
    },
    [
      fetchPlayers,
      currentSearch,
      currentSearchField,
      itemsPerPage,
      currentSortField,
      currentSortDirection,
    ]
  );

  const handleOpenColumnModal = useCallback(() => {
    setIsColumnModalOpen(true);
  }, []);

  const handleCloseColumnModal = useCallback(() => {
    setIsColumnModalOpen(false);
  }, []);

  const handleColumnToggle = useCallback(
    (columnKey: string, isVisible: boolean) => {
      setVisibleColumns(prev =>
        isVisible ? [...prev, columnKey] : prev.filter(col => col !== columnKey)
      );
    },
    []
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);

      fetchPlayers(
        currentSearch,
        currentSearchField,
        page,
        itemsPerPage,
        currentSortField,
        currentSortDirection,
        currentFilters,
        true
      );
    },
    [
      fetchPlayers,
      currentSearch,
      currentSearchField,
      itemsPerPage,
      currentSortField,
      currentSortDirection,
      currentFilters,
    ]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage: number) => {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1);

      fetchPlayers(
        currentSearch,
        currentSearchField,
        1,
        newItemsPerPage,
        currentSortField,
        currentSortDirection,
        currentFilters,
        true
      );
    },
    [
      fetchPlayers,
      currentSearch,
      currentSearchField,
      currentSortField,
      currentSortDirection,
      currentFilters,
    ]
  );

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  const isColumnVisible = (columnKey: string): boolean => {
    return visibleColumns.includes(columnKey);
  };

  const getSortArrow = (field: SortField): string => {
    if (currentSortField !== field) return '';
    return currentSortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const getSortTooltip = (field: SortField): string => {
    if (currentSortField !== field) {
      return `Click to sort by ${field}`;
    }
    const nextDirection =
      currentSortDirection === 'asc' ? 'descending' : 'ascending';
    return `Currently sorted by ${field} ${currentSortDirection}, click for ${nextDirection}`;
  };

  const isSearchActive = currentSearch.trim().length > 0;

  if (loading) {
    return (
      <div className="players-container">
        <h1>Hockey Players</h1>
        <div className="loading">Loading players...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="players-container">
        <h1>Hockey Players</h1>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="players-container">
      <h1>Hockey Players</h1>

      <PlayerSearch
        onSearch={handleSearch}
        onClear={() => handleSearch('', 'all')}
        onOpenFilters={handleOpenFilters}
        disabled={searchLoading}
        activeFiltersCount={currentFilters.length}
      />

      <div className="table-top-bar">
        <div className="top-bar-left">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>

        <div className="top-bar-center">
          <div className="results-info">
            Showing {players.length} of {totalCount} players
          </div>
        </div>

        <div className="top-bar-right">
          <div className="sort-filter-info">
            <div className="sort-info">
              Sorted by{' '}
              {getSortTooltip(currentSortField)
                .replace('Click to sort by ', '')
                .replace('Currently sorted by ', '')}{' '}
              ({currentSortDirection})
            </div>

            {currentFilters.length > 0 && (
              <div className="filter-info">
                Filtered by:{' '}
                {currentFilters
                  .map(
                    filter =>
                      `${filter.field} ${filter.operator} ${filter.value}`
                  )
                  .join(', ')}
              </div>
            )}

            <div className="table-controls">
              <button
                type="button"
                className="control-button"
                onClick={handleOpenColumnModal}
                aria-label="Manage visible columns"
                title="Choose which columns to display"
              >
                📋 Columns
              </button>

              <button
                type="button"
                className="control-button filters-button"
                onClick={handleOpenFilters}
                data-testid="filters-button"
                aria-label={`Filters (${currentFilters.length} active)`}
                title={`${currentFilters.length} filters applied`}
              >
                🔽 Filters{' '}
                {currentFilters.length > 0 && `(${currentFilters.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="players-table">
          <thead>
            <tr>
              {isColumnVisible('name') && (
                <th
                  className={`sortable-header ${
                    currentSortField === 'name' ? 'sorted' : ''
                  }`}
                  onClick={() => handleSort('name')}
                  title={getSortTooltip('name')}
                >
                  Name{getSortArrow('name')}
                </th>
              )}

              {isColumnVisible('jersey_number') && (
                <th
                  className={`sortable-header ${
                    currentSortField === 'jersey_number' ? 'sorted' : ''
                  }`}
                  onClick={() => handleSort('jersey_number')}
                  title={getSortTooltip('jersey_number')}
                >
                  #{getSortArrow('jersey_number')}
                </th>
              )}

              {isColumnVisible('position') && (
                <th
                  className={`sortable-header ${
                    currentSortField === 'position' ? 'sorted' : ''
                  }`}
                  onClick={() => handleSort('position')}
                  title={getSortTooltip('position')}
                >
                  Position{getSortArrow('position')}
                </th>
              )}

              {isColumnVisible('team') && (
                <th
                  className={`sortable-header ${
                    currentSortField === 'team' ? 'sorted' : ''
                  }`}
                  onClick={() => handleSort('team')}
                  title={getSortTooltip('team')}
                >
                  Team{getSortArrow('team')}
                </th>
              )}

              {isColumnVisible('goals') && (
                <th
                  className={`sortable-header ${
                    currentSortField === 'goals' ? 'sorted' : ''
                  }`}
                  onClick={() => handleSort('goals')}
                  title={getSortTooltip('goals')}
                >
                  Goals{getSortArrow('goals')}
                </th>
              )}

              {isColumnVisible('assists') && (
                <th
                  className={`sortable-header ${
                    currentSortField === 'assists' ? 'sorted' : ''
                  }`}
                  onClick={() => handleSort('assists')}
                  title={getSortTooltip('assists')}
                >
                  Assists{getSortArrow('assists')}
                </th>
              )}

              {isColumnVisible('points') && (
                <th
                  className={`sortable-header ${
                    currentSortField === 'points' ? 'sorted' : ''
                  }`}
                  onClick={() => handleSort('points')}
                  title={getSortTooltip('points')}
                >
                  Points{getSortArrow('points')}
                </th>
              )}

              {isColumnVisible('active_status') && (
                <th
                  className={`sortable-header ${
                    currentSortField === 'active_status' ? 'sorted' : ''
                  }`}
                  onClick={() => handleSort('active_status')}
                  title={getSortTooltip('active_status')}
                >
                  Status{getSortArrow('active_status')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="no-results">
                  {isSearchActive
                    ? 'No players match your search criteria.'
                    : 'No players to display.'}
                </td>
              </tr>
            ) : (
              players.map(player => (
                <tr
                  key={player.id}
                  className={!player.active_status ? 'retired-player' : ''}
                >
                  {isColumnVisible('name') && (
                    <td>
                      <button
                        className="player-name-link"
                        onClick={() => handlePlayerClick(player)}
                        aria-label={`View details for ${player.name}`}
                      >
                        <span className="player-name">{player.name}</span>
                      </button>
                    </td>
                  )}

                  {isColumnVisible('jersey_number') && (
                    <td>
                      <span className="jersey-number">
                        #{player.jersey_number}
                      </span>
                    </td>
                  )}

                  {isColumnVisible('position') && <td>{player.position}</td>}

                  {isColumnVisible('team') && <td>{player.team.name}</td>}

                  {isColumnVisible('goals') && (
                    <td>
                      <span className="stat">{player.goals}</span>
                    </td>
                  )}

                  {isColumnVisible('assists') && (
                    <td>
                      <span className="stat">{player.assists}</span>
                    </td>
                  )}

                  {isColumnVisible('points') && (
                    <td>
                      <span className="stat points">{player.points}</span>
                    </td>
                  )}

                  {isColumnVisible('active_status') && (
                    <td>
                      <span
                        className={`status ${
                          player.active_status ? 'active' : 'retired'
                        }`}
                      >
                        {player.active_status ? 'Active' : 'Retired'}
                      </span>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PlayerDetailsModal
        player={selectedPlayer}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilters}
        onApplyFilters={handleApplyFilters}
        currentFilters={currentFilters}
      />

      <ColumnToggleModal
        isOpen={isColumnModalOpen}
        onClose={handleCloseColumnModal}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
      />
    </div>
  );
};

export default PlayersTable;
