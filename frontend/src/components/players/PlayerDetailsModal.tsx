import React from "react";
import { Player } from "../../types/Player";
import Modal from "../modals/Modal";
import "./PlayerDetailsModal.css";

interface PlayerDetailsModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (player: Player) => void;
  onDelete?: (player: Player) => void;
}

const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({
  player,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!player) {
    return null;
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.warn("PlayerDetailsModal: Invalid date format:", dateString);
      return dateString;
    }
  };

  const headerActions = (onEdit || onDelete) && (
    <>
      {onEdit && (
        <button
          type="button"
          className="action-button edit-button"
          onClick={() => onEdit(player)}
          aria-label="Edit player"
        >
          Edit
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="action-button delete-button"
          onClick={() => onDelete(player)}
          aria-label="Delete player"
        >
          Delete
        </button>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${player.name} - #${player.jersey_number}`}
      headerActions={headerActions}
    >
      <div className="player-details">
        <div className="player-section">
          <h3 className="section-title">Player Details</h3>
          <div className="player-info-grid">
            <div className="info-item">
              <span className="info-label">Position:</span>
              <span className="info-value">{player.position}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Team:</span>
              <span className="info-value">
                {player.team.city} {player.team.name}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Nationality:</span>
              <span className="info-value">{player.nationality}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Jersey Number:</span>
              <span className="info-value">#{player.jersey_number}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Birth Date:</span>
              <span className="info-value">
                {formatDate(player.birth_date)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Handedness:</span>
              <span className="info-value">{player.handedness}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Height:</span>
              <span className="info-value">{player.height}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Weight:</span>
              <span className="info-value">{player.weight} lbs</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span
                className={`info-value status ${
                  player.active_status ? "active" : "retired"
                }`}
              >
                {player.active_status ? "Active" : "Retired"}
              </span>
            </div>
          </div>
        </div>

        <div className="player-section">
          <h3 className="section-title">Statistics</h3>

          {/* Regular Season Stats */}
          <div className="stats-row">
            <h4 className="stats-row-title">Regular Season</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Games Played</span>
                <span className="stat-value">
                  {player.regular_season_games_played}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Goals</span>
                <span className="stat-value">
                  {player.regular_season_goals}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Assists</span>
                <span className="stat-value">
                  {player.regular_season_assists}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Points</span>
                <span className="stat-value">
                  {player.regular_season_points}
                </span>
              </div>
            </div>
          </div>

          {/* Playoff Stats */}
          <div className="stats-row">
            <h4 className="stats-row-title">Playoffs</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Games Played</span>
                <span className="stat-value">
                  {player.playoff_games_played}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Goals</span>
                <span className="stat-value">{player.playoff_goals}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Assists</span>
                <span className="stat-value">{player.playoff_assists}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Points</span>
                <span className="stat-value">{player.playoff_points}</span>
              </div>
            </div>
          </div>

          {/* Total Stats (Calculated) */}
          <div className="stats-row total-stats">
            <h4 className="stats-row-title">Totals</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Games Played</span>
                <span className="stat-value">
                  {player.regular_season_games_played +
                    player.playoff_games_played}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Goals</span>
                <span className="stat-value">{player.goals}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Assists</span>
                <span className="stat-value">{player.assists}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Points</span>
                <span className="stat-value">{player.points}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PlayerDetailsModal;
