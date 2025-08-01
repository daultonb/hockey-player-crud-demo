/* eslint-disable no-console */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PlayerDetailsModal from './PlayerDetailsModal';
import PlayerSearch from './PlayerSearch';
import {
  Player,
  SearchField,
  SortField,
  SortDirection,
  PlayersApiResponse,
  SORTABLE_FIELDS,
} from '../../types/Player';

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
  const [currentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Sort state - default to name ascending
  const [currentSortField, setCurrentSortField] = useState<SortField>('name');
  const [currentSortDirection, setCurrentSortDirection] =
    useState<SortDirection>('asc');

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

  const fetchPlayers = useCallback(
    async (
      search?: string,
      field: SearchField = 'all',
      page: number = 1,
      sortBy: SortField = 'name',
      sortOrder: SortDirection = 'asc',
      showSearchLoading: boolean = false
    ) => {
      try {
        console.log('PlayersTable: Fetching players from API', {
          search,
          field,
          page,
          sortBy,
          sortOrder,
        });

        if (showSearchLoading) {
          setSearchLoading(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          sort_by: sortBy,
          sort_order: sortOrder,
        });

        if (search && search.trim()) {
          params.append('search', search.trim());
          params.append('field', field);
        }

        const response = await axios.get<PlayersApiResponse>(
          `${apiBaseUrl}/players?${params.toString()}`
        );

        console.log('PlayersTable: API response received', {
          playersCount: response.data.players.length,
          total: response.data.total,
          page: response.data.page,
          sortBy: response.data.sort_by,
          sortOrder: response.data.sort_order,
        });

        setPlayers(response.data.players);
        setTotalCount(response.data.total);
        setTotalPages(response.data.total_pages);
        setError(null);
      } catch (err) {
        console.error('PlayersTable: Error fetching players:', err);
        setError('Failed to fetch players. Please try again later.');
        setPlayers([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [apiBaseUrl]
  );

  // Initial load with default name ascending sort
  useEffect(() => {
    fetchPlayers('', 'all', 1, 'name', 'asc');
  }, [fetchPlayers]);

  const handleSearch = useCallback(
    (query: string, field: SearchField) => {
      console.log('PlayersTable: Search requested', { query, field });
      setCurrentSearch(query);
      setCurrentSearchField(field);
      // Maintain current sort when searching
      fetchPlayers(
        query,
        field,
        1,
        currentSortField,
        currentSortDirection,
        true
      );
    },
    [fetchPlayers, currentSortField, currentSortDirection]
  );

  const handleClearSearch = useCallback(() => {
    console.log('PlayersTable: Clear search requested');
    setCurrentSearch('');
    setCurrentSearchField('all');
    // Maintain current sort when clearing search
    fetchPlayers('', 'all', 1, currentSortField, currentSortDirection, true);
  }, [fetchPlayers, currentSortField, currentSortDirection]);

  const handleSort = useCallback(
    (field: SortField) => {
      console.log('PlayersTable: Sort requested', { field });

      let newDirection: SortDirection = 'asc';

      // Toggle direction on repeated sort
      if (currentSortField === field) {
        newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      }

      console.log('PlayersTable: Applying sort', {
        field,
        direction: newDirection,
      });

      setCurrentSortField(field);
      setCurrentSortDirection(newDirection);

      // Maintain current search when sorting
      fetchPlayers(
        currentSearch,
        currentSearchField,
        1,
        field,
        newDirection,
        true
      );
    },
    [
      fetchPlayers,
      currentSearch,
      currentSearchField,
      currentSortField,
      currentSortDirection,
    ]
  );

  const handlePlayerClick = (player: Player) => {
    console.log('PlayersTable: Player clicked:', player.name);
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('PlayersTable: Closing player details modal');
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  const getSortArrow = (field: SortField): string => {
    if (currentSortField !== field) return '';
    return currentSortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const getSortTooltip = (field: SortField): string => {
    const fieldConfig = SORTABLE_FIELDS.find(f => f.field === field);
    const fieldLabel = fieldConfig?.displayName || field;

    if (currentSortField === field) {
      const nextDirection =
        currentSortDirection === 'asc' ? 'descending' : 'ascending';
      return `Sort by ${fieldLabel} ${nextDirection}`;
    }

    return `Sort by ${fieldLabel}`;
  };

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

  const isSearchActive = currentSearch.trim() !== '';

  return (
    <div className="players-container">
      <h1>Hockey Players</h1>

      <PlayerSearch
        onSearch={handleSearch}
        onClear={handleClearSearch}
        disabled={loading || searchLoading}
      />

      {searchLoading && (
        <div className="search-loading">
          <p>Searching...</p>
        </div>
      )}

      <div className="table-container">
        <table className="players-table">
          <thead>
            <tr>
              <th
                className={`sortable-header ${
                  currentSortField === 'name' ? 'sorted' : ''
                }`}
                onClick={() => handleSort('name')}
                title={getSortTooltip('name')}
              >
                Name{getSortArrow('name')}
              </th>
              <th
                className={`sortable-header ${
                  currentSortField === 'position' ? 'sorted' : ''
                }`}
                onClick={() => handleSort('position')}
                title={getSortTooltip('position')}
              >
                Position{getSortArrow('position')}
              </th>
              <th
                className={`sortable-header ${
                  currentSortField === 'team' ? 'sorted' : ''
                }`}
                onClick={() => handleSort('team')}
                title={getSortTooltip('team')}
              >
                Team{getSortArrow('team')}
              </th>
              <th
                className={`sortable-header ${
                  currentSortField === 'jersey_number' ? 'sorted' : ''
                }`}
                onClick={() => handleSort('jersey_number')}
                title={getSortTooltip('jersey_number')}
              >
                Jersey #{getSortArrow('jersey_number')}
              </th>
              <th
                className={`sortable-header ${
                  currentSortField === 'goals' ? 'sorted' : ''
                }`}
                onClick={() => handleSort('goals')}
                title={getSortTooltip('goals')}
              >
                Goals{getSortArrow('goals')}
              </th>
              <th
                className={`sortable-header ${
                  currentSortField === 'assists' ? 'sorted' : ''
                }`}
                onClick={() => handleSort('assists')}
                title={getSortTooltip('assists')}
              >
                Assists{getSortArrow('assists')}
              </th>
              <th
                className={`sortable-header ${
                  currentSortField === 'points' ? 'sorted' : ''
                }`}
                onClick={() => handleSort('points')}
                title={getSortTooltip('points')}
              >
                Points{getSortArrow('points')}
              </th>
              <th
                className={`sortable-header ${
                  currentSortField === 'active_status' ? 'sorted' : ''
                }`}
                onClick={() => handleSort('active_status')}
                title={getSortTooltip('active_status')}
              >
                Status{getSortArrow('active_status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-results">
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
                  <td>
                    <button
                      className="player-name-link"
                      onClick={() => handlePlayerClick(player)}
                      aria-label={`View details for ${player.name}`}
                    >
                      <span className="player-name">{player.name}</span>
                    </button>
                  </td>
                  <td>{player.position}</td>
                  <td>{player.team.name}</td>
                  <td>
                    <span className="jersey-number">
                      #{player.jersey_number}
                    </span>
                  </td>
                  <td>
                    <span className="stat">{player.goals}</span>
                  </td>
                  <td>
                    <span className="stat">{player.assists}</span>
                  </td>
                  <td>
                    <span className="stat points">{player.points}</span>
                  </td>
                  <td>
                    <span
                      className={`status ${
                        player.active_status ? 'active' : 'retired'
                      }`}
                    >
                      {player.active_status ? 'Active' : 'Retired'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>
          {isSearchActive
            ? `Showing ${players.length} of ${totalCount} matching players`
            : `Showing ${players.length} of ${totalCount} players`}
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          {currentSortField && (
            <span className="sort-info">
              {' • '}Sorted by{' '}
              {
                SORTABLE_FIELDS.find(f => f.field === currentSortField)
                  ?.displayName
              }{' '}
              ({currentSortDirection === 'asc' ? 'A-Z' : 'Z-A'})
            </span>
          )}
        </p>
      </div>

      <PlayerDetailsModal
        player={selectedPlayer}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default PlayersTable;
