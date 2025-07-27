import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Team {
  id: number;
  name: string;
  city: string;
}

interface Player {
  id: number;
  name: string;
  position: string;
  nationality: string;
  jersey_number: number;
  birth_date: string;
  height: string;
  weight: number;
  handedness: string;
  goals: number;
  assists: number;
  points: number;
  active_status: boolean;
  team: Team;
}

interface PlayersResponse {
  players: Player[];
  count: number;
}

const PlayersTable: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get<PlayersResponse>(`${apiBaseUrl}/players`);
      setPlayers(response.data.players);
      setError(null);
    } catch (err) {
      setError('Failed to fetch players data');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading players...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="players-container">
      <h1>Hockey Players Management</h1>
      <div className="table-info">
        <p>Total Players: {players.length}</p>
      </div>
      
      <div className="table-container">
        <table className="players-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Team</th>
              <th>Jersey #</th>
              <th>Nationality</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Goals</th>
              <th>Assists</th>
              <th>Points</th>
              <th>Status</th>
              <th>Handedness</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className={!player.active_status ? 'inactive-player' : ''}>
                <td className="player-name">{player.name}</td>
                <td>{player.position}</td>
                <td>{player.team.city} {player.team.name}</td>
                <td className="jersey-number">#{player.jersey_number}</td>
                <td>{player.nationality}</td>
                <td>{player.height}</td>
                <td>{player.weight} lbs</td>
                <td className="stat">{player.goals}</td>
                <td className="stat">{player.assists}</td>
                <td className="stat points">{player.points}</td>
                <td>
                  <span className={`status ${player.active_status ? 'active' : 'inactive'}`}>
                    {player.active_status ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{player.handedness}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayersTable;