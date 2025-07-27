import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlayerDetailsModal from './PlayerDetailsModal';
import PlayerSearch from './PlayerSearch';
import { Player, PlayersResponse, SearchField, SEARCHABLE_FIELDS } from '../../types/Player';

const PlayersTable: React.FC = () => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        console.log('PlayersTable: Fetching players from API');
        setLoading(true);
        const response = await axios.get<PlayersResponse>(`${apiBaseUrl}/players`);
        console.log('PlayersTable: Raw API response:', response.data);
        
        if (response.data && Array.isArray(response.data.players)) {
          console.log('PlayersTable: Successfully fetched', response.data.players.length, 'players');
          setAllPlayers(response.data.players);
          setFilteredPlayers(response.data.players);
          setError(null);
        } else {
          console.error('PlayersTable: Invalid API response structure:', response.data);
          setError('Invalid data format received from server.');
        }
      } catch (err) {
        console.error('PlayersTable: Error fetching players:', err);
        setError('Failed to fetch players. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [apiBaseUrl]);

  const getPlayerFieldValue = (player: Player, field: SearchField): string => {
    switch (field) {
      case 'name':
        return player.name;
      case 'position':
        return player.position;
      case 'team':
        return player.team.name;
      case 'nationality':
        return player.nationality;
      case 'jersey_number':
        return player.jersey_number.toString();
      default:
        return '';
    }
  };

  const searchPlayers = (query: string, field: SearchField) => {
    console.log('PlayersTable: Searching players with query:', query, 'field:', field);
    setIsSearching(true);
    
    const searchTerm = query.toLowerCase().trim();
    
    const filtered = allPlayers.filter(player => {
      if (field === 'all') {
        // Search across all searchable fields
        return SEARCHABLE_FIELDS.some(searchField => {
          if (searchField.value === 'all') return false;
          const fieldValue = getPlayerFieldValue(player, searchField.value);
          return fieldValue.toLowerCase().includes(searchTerm);
        });
      } else {
        // Search specific field
        const fieldValue = getPlayerFieldValue(player, field);
        return fieldValue.toLowerCase().includes(searchTerm);
      }
    });
    
    console.log('PlayersTable: Search results -', filtered.length, 'players found');
    setFilteredPlayers(filtered);
  };

  const clearSearch = () => {
    console.log('PlayersTable: Clearing search, showing all players');
    setFilteredPlayers(allPlayers);
    setIsSearching(false);
  };

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

  return (
    <div className="players-container">
      <h1>Hockey Players</h1>
      
      <PlayerSearch 
        onSearch={searchPlayers}
        onClear={clearSearch}
        disabled={loading}
      />
      
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
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-results">
                  {isSearching ? 'No players match your search criteria.' : 'No players to display.'}
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => (
                <tr key={player.id} className={!player.active_status ? 'retired-player' : ''}>
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
                    <span className="jersey-number">#{player.jersey_number}</span>
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
                    <span className={`status ${player.active_status ? 'active' : 'retired'}`}>
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
        <p>Showing {filteredPlayers.length} of {allPlayers.length} players</p>
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