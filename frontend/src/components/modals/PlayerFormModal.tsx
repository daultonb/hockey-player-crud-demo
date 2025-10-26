import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  ACTIVE_STATUS_OPTIONS,
  HANDEDNESS_OPTIONS,
  Player,
  PlayerCreate,
  PlayerUpdate,
  POSITION_OPTIONS,
  Team,
} from "../../types/Player";
import { useToast } from "../ToastContainer";
import Modal from "./Modal";
import "./PlayerFormModal.css";

interface PlayerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  player?: Player;
}

interface FormData {
  name: string;
  jersey_number: string;
  position: string;
  team_id: string;
  nationality: string;
  birth_date: string;
  height: string;
  weight: string;
  handedness: string;
  active_status: boolean;
  regular_season_games_played: string;
  regular_season_goals: string;
  regular_season_assists: string;
  playoff_games_played: string;
  playoff_goals: string;
  playoff_assists: string;
}

interface FormErrors {
  [key: string]: string;
}

const PlayerFormModal: React.FC<PlayerFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  player,
}) => {
  const { showToast } = useToast();
  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  const [teams, setTeams] = useState<Team[]>([]);
  const [showPlayoffFields, setShowPlayoffFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: "",
    jersey_number: "",
    position: "",
    team_id: "",
    nationality: "",
    birth_date: "",
    height: "",
    weight: "",
    handedness: "",
    active_status: true,
    regular_season_games_played: "0",
    regular_season_goals: "0",
    regular_season_assists: "0",
    playoff_games_played: "0",
    playoff_goals: "0",
    playoff_assists: "0",
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get<Team[]>(`${apiBaseUrl}/teams`);
        setTeams(response.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
        showToast("Failed to load teams", "error");
      }
    };

    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen, apiBaseUrl, showToast]);

  useEffect(() => {
    if (isOpen && mode === "edit" && player) {
      setFormData({
        name: player.name,
        jersey_number: String(player.jersey_number),
        position: player.position,
        team_id: String(player.team.id),
        nationality: player.nationality,
        birth_date: player.birth_date,
        height: player.height,
        weight: String(player.weight),
        handedness: player.handedness,
        active_status: player.active_status,
        regular_season_games_played: String(player.regular_season_games_played),
        regular_season_goals: String(player.regular_season_goals),
        regular_season_assists: String(player.regular_season_assists),
        playoff_games_played: String(player.playoff_games_played),
        playoff_goals: String(player.playoff_goals),
        playoff_assists: String(player.playoff_assists),
      });

      if (
        player.playoff_games_played > 0 ||
        player.playoff_goals > 0 ||
        player.playoff_assists > 0
      ) {
        setShowPlayoffFields(true);
      }
    } else if (isOpen && mode === "add") {
      setFormData({
        name: "",
        jersey_number: "",
        position: "",
        team_id: "",
        nationality: "",
        birth_date: "",
        height: "",
        weight: "",
        handedness: "",
        active_status: true,
        regular_season_games_played: "0",
        regular_season_goals: "0",
        regular_season_assists: "0",
        playoff_games_played: "0",
        playoff_goals: "0",
        playoff_assists: "0",
      });
      setShowPlayoffFields(false);
    }
    setErrors({});
  }, [isOpen, mode, player]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    const jerseyNumber = parseInt(formData.jersey_number);
    if (isNaN(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99) {
      newErrors.jersey_number = "Jersey number must be between 0 and 99";
    }

    if (!formData.position) {
      newErrors.position = "Position is required";
    }

    if (!formData.team_id) {
      newErrors.team_id = "Team is required";
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = "Nationality is required";
    }

    if (!formData.birth_date) {
      newErrors.birth_date = "Birth date is required";
    }

    if (!formData.height.trim()) {
      newErrors.height = "Height is required";
    }

    const weight = parseInt(formData.weight);
    if (isNaN(weight) || weight <= 0) {
      newErrors.weight = "Weight must be a positive number";
    }

    if (!formData.handedness) {
      newErrors.handedness = "Handedness is required";
    }

    const regularGamesPlayed = parseInt(formData.regular_season_games_played);
    if (isNaN(regularGamesPlayed) || regularGamesPlayed < 0) {
      newErrors.regular_season_games_played = "Must be a non-negative number";
    }

    const regularGoals = parseInt(formData.regular_season_goals);
    if (isNaN(regularGoals) || regularGoals < 0) {
      newErrors.regular_season_goals = "Must be a non-negative number";
    }

    const regularAssists = parseInt(formData.regular_season_assists);
    if (isNaN(regularAssists) || regularAssists < 0) {
      newErrors.regular_season_assists = "Must be a non-negative number";
    }

    if (showPlayoffFields) {
      const playoffGamesPlayed = parseInt(formData.playoff_games_played);
      if (isNaN(playoffGamesPlayed) || playoffGamesPlayed < 0) {
        newErrors.playoff_games_played = "Must be a non-negative number";
      }

      const playoffGoals = parseInt(formData.playoff_goals);
      if (isNaN(playoffGoals) || playoffGoals < 0) {
        newErrors.playoff_goals = "Must be a non-negative number";
      }

      const playoffAssists = parseInt(formData.playoff_assists);
      if (isNaN(playoffAssists) || playoffAssists < 0) {
        newErrors.playoff_assists = "Must be a non-negative number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // validateForm is intentionally not in dependencies to avoid unnecessary re-renders
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (!validateForm()) {
        showToast("Please fix the form errors", "error");
        return;
      }

      setSubmitting(true);

      try {
        const payload: PlayerCreate | PlayerUpdate = {
          name: formData.name.trim(),
          jersey_number: parseInt(formData.jersey_number),
          position: formData.position,
          team_id: parseInt(formData.team_id),
          nationality: formData.nationality.trim(),
          birth_date: formData.birth_date,
          height: formData.height.trim(),
          weight: parseInt(formData.weight),
          handedness: formData.handedness,
          active_status: formData.active_status,
          regular_season_games_played: parseInt(
            formData.regular_season_games_played
          ),
          regular_season_goals: parseInt(formData.regular_season_goals),
          regular_season_assists: parseInt(formData.regular_season_assists),
          playoff_games_played: showPlayoffFields
            ? parseInt(formData.playoff_games_played)
            : 0,
          playoff_goals: showPlayoffFields
            ? parseInt(formData.playoff_goals)
            : 0,
          playoff_assists: showPlayoffFields
            ? parseInt(formData.playoff_assists)
            : 0,
        };

        if (mode === "add") {
          await axios.post(`${apiBaseUrl}/players`, payload);
          showToast("Player added successfully", "success");
        } else if (mode === "edit" && player) {
          await axios.put(`${apiBaseUrl}/players/${player.id}`, payload);
          showToast("Player updated successfully", "success");
        }

        onSuccess();
        onClose();
      } catch (error: any) {
        console.error("Error submitting player:", error);
        const errorMessage =
          error.response?.data?.detail ||
          `Failed to ${mode === "add" ? "add" : "update"} player`;
        showToast(errorMessage, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [
      formData,
      showPlayoffFields,
      mode,
      player,
      apiBaseUrl,
      showToast,
      onSuccess,
      onClose,
    ]
  );

  const regularSeasonPoints =
    parseInt(formData.regular_season_goals || "0") +
    parseInt(formData.regular_season_assists || "0");

  const playoffPoints =
    parseInt(formData.playoff_goals || "0") +
    parseInt(formData.playoff_assists || "0");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Player" : "Edit Player"}
    >
      <form onSubmit={handleSubmit} className="player-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name" className="form-label required">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="Enter player name"
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="jersey_number" className="form-label required">
              Jersey Number
            </label>
            <input
              type="number"
              id="jersey_number"
              name="jersey_number"
              value={formData.jersey_number}
              onChange={handleInputChange}
              className={`form-input ${errors.jersey_number ? "error" : ""}`}
              placeholder="0-99"
              min="0"
              max="99"
            />
            {errors.jersey_number && (
              <span className="error-message">{errors.jersey_number}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="position" className="form-label required">
              Position
            </label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className={`form-select ${errors.position ? "error" : ""}`}
            >
              <option value="">Select position</option>
              {POSITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.position && (
              <span className="error-message">{errors.position}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="team_id" className="form-label required">
              Team
            </label>
            <select
              id="team_id"
              name="team_id"
              value={formData.team_id}
              onChange={handleInputChange}
              className={`form-select ${errors.team_id ? "error" : ""}`}
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.city})
                </option>
              ))}
            </select>
            {errors.team_id && (
              <span className="error-message">{errors.team_id}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="nationality" className="form-label required">
              Nationality
            </label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              className={`form-input ${errors.nationality ? "error" : ""}`}
              placeholder="e.g., Canada, USA, Sweden"
            />
            {errors.nationality && (
              <span className="error-message">{errors.nationality}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="birth_date" className="form-label required">
              Birth Date
            </label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleInputChange}
              className={`form-input ${errors.birth_date ? "error" : ""}`}
            />
            {errors.birth_date && (
              <span className="error-message">{errors.birth_date}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="height" className="form-label required">
              Height
            </label>
            <input
              type="text"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              className={`form-input ${errors.height ? "error" : ""}`}
              placeholder="e.g., 6'2&quot;"
            />
            {errors.height && (
              <span className="error-message">{errors.height}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="weight" className="form-label required">
              Weight (lbs)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className={`form-input ${errors.weight ? "error" : ""}`}
              placeholder="Weight in pounds"
              min="1"
            />
            {errors.weight && (
              <span className="error-message">{errors.weight}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="handedness" className="form-label required">
              Handedness
            </label>
            <div className="radio-group">
              {HANDEDNESS_OPTIONS.map((opt) => (
                <label key={opt.value} className="radio-label">
                  <input
                    type="radio"
                    name="handedness"
                    value={opt.value}
                    checked={formData.handedness === opt.value}
                    onChange={handleInputChange}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.handedness && (
              <span className="error-message">{errors.handedness}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Active Status</label>
            <div className="radio-group">
              {ACTIVE_STATUS_OPTIONS.map((opt) => (
                <label key={String(opt.value)} className="radio-label">
                  <input
                    type="radio"
                    name="active_status"
                    checked={formData.active_status === opt.value}
                    onChange={() =>
                      handleCheckboxChange("active_status", opt.value)
                    }
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h3>Regular Season Statistics</h3>
          <div className="stats-grid">
            <div className="form-group">
              <label
                htmlFor="regular_season_games_played"
                className="form-label"
              >
                Games Played
              </label>
              <input
                type="number"
                id="regular_season_games_played"
                name="regular_season_games_played"
                value={formData.regular_season_games_played}
                onChange={handleInputChange}
                className={`form-input ${
                  errors.regular_season_games_played ? "error" : ""
                }`}
                min="0"
              />
              {errors.regular_season_games_played && (
                <span className="error-message">
                  {errors.regular_season_games_played}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="regular_season_goals" className="form-label">
                Goals
              </label>
              <input
                type="number"
                id="regular_season_goals"
                name="regular_season_goals"
                value={formData.regular_season_goals}
                onChange={handleInputChange}
                className={`form-input ${
                  errors.regular_season_goals ? "error" : ""
                }`}
                min="0"
              />
              {errors.regular_season_goals && (
                <span className="error-message">
                  {errors.regular_season_goals}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="regular_season_assists" className="form-label">
                Assists
              </label>
              <input
                type="number"
                id="regular_season_assists"
                name="regular_season_assists"
                value={formData.regular_season_assists}
                onChange={handleInputChange}
                className={`form-input ${
                  errors.regular_season_assists ? "error" : ""
                }`}
                min="0"
              />
              {errors.regular_season_assists && (
                <span className="error-message">
                  {errors.regular_season_assists}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Points (Calculated)</label>
              <div className="calculated-value">{regularSeasonPoints}</div>
            </div>
          </div>
        </div>

        <div className="playoff-section">
          <button
            type="button"
            onClick={() => setShowPlayoffFields(!showPlayoffFields)}
            className="toggle-playoff-button"
          >
            {showPlayoffFields ? "Hide" : "Add"} Playoff Statistics
          </button>

          {showPlayoffFields && (
            <div className="stats-grid">
              <div className="form-group">
                <label htmlFor="playoff_games_played" className="form-label">
                  Games Played
                </label>
                <input
                  type="number"
                  id="playoff_games_played"
                  name="playoff_games_played"
                  value={formData.playoff_games_played}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.playoff_games_played ? "error" : ""
                  }`}
                  min="0"
                />
                {errors.playoff_games_played && (
                  <span className="error-message">
                    {errors.playoff_games_played}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="playoff_goals" className="form-label">
                  Goals
                </label>
                <input
                  type="number"
                  id="playoff_goals"
                  name="playoff_goals"
                  value={formData.playoff_goals}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.playoff_goals ? "error" : ""
                  }`}
                  min="0"
                />
                {errors.playoff_goals && (
                  <span className="error-message">{errors.playoff_goals}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="playoff_assists" className="form-label">
                  Assists
                </label>
                <input
                  type="number"
                  id="playoff_assists"
                  name="playoff_assists"
                  value={formData.playoff_assists}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.playoff_assists ? "error" : ""
                  }`}
                  min="0"
                />
                {errors.playoff_assists && (
                  <span className="error-message">
                    {errors.playoff_assists}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Points (Calculated)</label>
                <div className="calculated-value">{playoffPoints}</div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="button button-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : mode === "add"
              ? "Add Player"
              : "Update Player"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PlayerFormModal;
