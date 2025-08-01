/* eslint-disable no-console */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PlayerDetailsModal from './PlayerDetailsModal';
import PlayerSearch from './PlayerSearch';
import { Player, SearchField } from '../../types/Player';

interface PlayersApiResponse {
  players: Player[];
  count: number;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  search_query: string | null;
  search_field: SearchField;
}

const PlayersTable: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Search and pagination state
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [currentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

  const fetchPlayers = useCallback(
    async (
      search?: string,
      field: SearchField = 'all',
      page: number = 1,
      showSearchLoading: boolean = false
    ) => {
      try {
        console.log('PlayersTable: Fetching players from API', {
          search,
          field,
          page,
        });

        if (showSearchLoading) {
          setSearchLoading(true);
        } else {
          setLoading(true);
        }

        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
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

  // Initial load
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleSearch = useCallback(
    (query: string, field: SearchField) => {
      console.log('PlayersTable: Search requested', { query, field });
      setCurrentSearch(query);
      fetchPlayers(query, field, 1, true);
    },
    [fetchPlayers]
  );

  const handleClearSearch = useCallback(() => {
    console.log('PlayersTable: Clear search requested');
    setCurrentSearch('');
    fetchPlayers('', 'all', 1, true);
  }, [fetchPlayers]);

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
              <th>Name</th>
              <th>Position</th>
              <th>Team</th>
              <th>Jersey #</th>
              <th>Goals</th>
              <th>Assists</th>
              <th>Points</th>
              <th>Status</th>
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
