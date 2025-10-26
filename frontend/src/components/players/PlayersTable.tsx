import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { JSX } from "react/jsx-runtime";
import {
  Player,
  PlayerFilter,
  PlayersApiResponse,
  SearchField,
  SortDirection,
  SortField,
} from "../../types/Player";
import ColumnToggleModal from "../modals/ColumnToggleModal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import FilterModal from "../modals/FilterModal";
import PlayerFormModal from "../modals/PlayerFormModal";
import { useToast } from "../ToastContainer";
import PaginationControls from "./PaginationControls";
import "./PaginationControls.css";
import PlayerDetailsModal from "./PlayerDetailsModal";
import PlayerSearch from "./PlayerSearch";
import "./PlayersTable.css";

const PlayersTable: React.FC = () => {
  const { showToast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Search and pagination state
  const [currentSearch, setCurrentSearch] = useState<string>("");
  const [currentSearchField, setCurrentSearchField] =
    useState<SearchField>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Sort state - default to name ascending
  const [currentSortField, setCurrentSortField] = useState<SortField>("name");
  const [currentSortDirection, setCurrentSortDirection] =
    useState<SortDirection>("asc");

  // Filter state
  const [currentFilters, setCurrentFilters] = useState<PlayerFilter[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Column visibility state
  const [isColumnModalOpen, setIsColumnModalOpen] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // Add player modal state
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] =
    useState<boolean>(false);

  // Edit player modal state
  const [isEditPlayerModalOpen, setIsEditPlayerModalOpen] =
    useState<boolean>(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

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
          params.append("search", search.trim());
        }

        if (searchField !== undefined) {
          params.append("field", searchField);
        }

        if (filters && filters.length > 0) {
          params.append("filters", JSON.stringify(filters));
        }

        const response = await axios.get<PlayersApiResponse>(
          `${apiBaseUrl}/players?${params}`
        );

        setPlayers(response.data.players);
        setTotalCount(response.data.total);
        setTotalPages(response.data.total_pages);
      } catch (err) {
        console.error("Error fetching players:", err);
        setError("Failed to fetch players. Please try again later.");
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

  // Fetch default visible columns from backend on mount
  useEffect(() => {
    const fetchDefaultColumns = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/column-metadata`);
        if (response.data?.default_visible_columns) {
          setVisibleColumns(response.data.default_visible_columns);
        }
      } catch (error) {
        console.warn("Failed to fetch default columns, using fallback:", error);
        // Fallback to hardcoded defaults if API fails
        setVisibleColumns([
          "name",
          "jersey_number",
          "position",
          "team",
          "goals",
          "assists",
          "points",
          "active_status",
        ]);
      }
    };

    fetchDefaultColumns();
  }, [apiBaseUrl]);

  useEffect(() => {
    // Only fetch players once default columns are loaded
    if (visibleColumns.length > 0) {
      fetchPlayers();
    }
  }, [visibleColumns.length]);

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
      let newDirection: SortDirection = "asc";

      if (currentSortField === field) {
        newDirection = currentSortDirection === "asc" ? "desc" : "asc";
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

  const handleColumnsChange = useCallback((columns: string[]) => {
    setVisibleColumns(columns);
  }, []);

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

  const handleOpenAddPlayer = useCallback(() => {
    setIsAddPlayerModalOpen(true);
  }, []);

  const handleCloseAddPlayer = useCallback(() => {
    setIsAddPlayerModalOpen(false);
  }, []);

  const handleAddPlayerSuccess = useCallback(() => {
    fetchPlayers(
      currentSearch,
      currentSearchField,
      currentPage,
      itemsPerPage,
      currentSortField,
      currentSortDirection,
      currentFilters,
      true
    );
  }, [
    fetchPlayers,
    currentSearch,
    currentSearchField,
    currentPage,
    itemsPerPage,
    currentSortField,
    currentSortDirection,
    currentFilters,
  ]);

  const handleEditPlayer = useCallback((player: Player) => {
    setEditingPlayer(player);
    setIsEditPlayerModalOpen(true);
    setIsModalOpen(false);
  }, []);

  const handleCloseEditPlayer = useCallback(() => {
    setIsEditPlayerModalOpen(false);
    setEditingPlayer(null);
  }, []);

  const handleEditPlayerSuccess = useCallback(() => {
    fetchPlayers(
      currentSearch,
      currentSearchField,
      currentPage,
      itemsPerPage,
      currentSortField,
      currentSortDirection,
      currentFilters,
      true
    );
  }, [
    fetchPlayers,
    currentSearch,
    currentSearchField,
    currentPage,
    itemsPerPage,
    currentSortField,
    currentSortDirection,
    currentFilters,
  ]);

  const handleDeletePlayer = useCallback((player: Player) => {
    setDeletingPlayer(player);
    setIsDeleteModalOpen(true);
    setIsModalOpen(false);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingPlayer(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingPlayer) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${apiBaseUrl}/players/${deletingPlayer.id}`);
      showToast(
        `Player ${deletingPlayer.name} deleted successfully`,
        "success"
      );

      setIsDeleteModalOpen(false);
      setDeletingPlayer(null);

      fetchPlayers(
        currentSearch,
        currentSearchField,
        currentPage,
        itemsPerPage,
        currentSortField,
        currentSortDirection,
        currentFilters,
        true
      );
    } catch (error: any) {
      console.error("Error deleting player:", error);
      const errorMessage =
        error.response?.data?.detail || "Failed to delete player";
      showToast(errorMessage, "error");
    } finally {
      setIsDeleting(false);
    }
  }, [
    deletingPlayer,
    apiBaseUrl,
    showToast,
    fetchPlayers,
    currentSearch,
    currentSearchField,
    currentPage,
    itemsPerPage,
    currentSortField,
    currentSortDirection,
    currentFilters,
  ]);

  const getSortArrow = (field: SortField): string => {
    if (currentSortField !== field) return "";
    return currentSortDirection === "asc" ? " ↑" : " ↓";
  };

  const getSortTooltip = (field: SortField): string => {
    if (currentSortField !== field) {
      return `Click to sort by ${field}`;
    }
    const nextDirection =
      currentSortDirection === "asc" ? "descending" : "ascending";
    return `Currently sorted by ${field} ${currentSortDirection}, click for ${nextDirection}`;
  };
  const getColumnHeader = (columnKey: string): JSX.Element | null => {
    const headerMap: Record<string, { label: string; sortable: boolean }> = {
      name: { label: "Name", sortable: true },
      jersey_number: { label: "#", sortable: true },
      position: { label: "Position", sortable: true },
      team: { label: "Team", sortable: true },
      active_status: { label: "Status", sortable: true },
      regular_season_games_played: {
        label: "Regular Season GP",
        sortable: true,
      },
      regular_season_goals: { label: "Regular Season Goals", sortable: true },
      regular_season_assists: {
        label: "Regular Season Assists",
        sortable: true,
      },
      regular_season_points: { label: "Regular Season Points", sortable: true },
      playoff_games_played: { label: "Playoff GP", sortable: true },
      playoff_goals: { label: "Playoff Goals", sortable: true },
      playoff_assists: { label: "Playoff Assists", sortable: true },
      playoff_points: { label: "Playoff Points", sortable: true },
      games_played: { label: "Games Played", sortable: true },
      goals: { label: "Goals", sortable: true },
      assists: { label: "Assists", sortable: true },
      points: { label: "Points", sortable: true },
    };

    const config = headerMap[columnKey];
    if (!config) return null;

    if (config.sortable) {
      return (
        <th
          className={`sortable-header ${
            currentSortField === columnKey ? "sorted" : ""
          }`}
          onClick={() => handleSort(columnKey as SortField)}
          title={getSortTooltip(columnKey as SortField)}
        >
          {config.label}
          {getSortArrow(columnKey as SortField)}
        </th>
      );
    }

    return <th>{config.label}</th>;
  };

  const getCellValue = (
    player: Player,
    columnKey: string
  ): JSX.Element | null => {
    switch (columnKey) {
      case "name":
        return (
          <button
            className="player-name-link"
            onClick={() => handlePlayerClick(player)}
            aria-label={`View details for ${player.name}`}
          >
            <span className="player-name">{player.name}</span>
          </button>
        );
      case "jersey_number":
        return <span className="jersey-number">#{player.jersey_number}</span>;
      case "position":
        return <>{player.position}</>;
      case "team":
        return <>{player.team.name}</>;
      case "goals":
        return <span className="stat">{player.goals}</span>;
      case "assists":
        return <span className="stat">{player.assists}</span>;
      case "points":
        return <span className="stat points">{player.points}</span>;
      case "active_status":
        return (
          <span
            className={`status ${player.active_status ? "active" : "retired"}`}
          >
            {player.active_status ? "Active" : "Retired"}
          </span>
        );
      case "regular_season_goals":
        return <span className="stat">{player.regular_season_goals}</span>;
      case "regular_season_assists":
        return <span className="stat">{player.regular_season_assists}</span>;
      case "regular_season_points":
        return <span className="stat">{player.regular_season_points}</span>;
      case "regular_season_games_played":
        return (
          <span className="stat">{player.regular_season_games_played}</span>
        );
      case "playoff_goals":
        return <span className="stat">{player.playoff_goals}</span>;
      case "playoff_assists":
        return <span className="stat">{player.playoff_assists}</span>;
      case "playoff_points":
        return <span className="stat">{player.playoff_points}</span>;
      case "playoff_games_played":
        return <span className="stat">{player.playoff_games_played}</span>;
      default:
        return <>{player[columnKey as keyof Player]?.toString() || "-"}</>;
    }
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
        onClear={() => handleSearch("", "all")}
        onOpenFilters={handleOpenFilters}
        disabled={searchLoading}
        activeFiltersCount={currentFilters.length}
      />

      <div className="table-top-bar">
        <div className="top-bar-left">
          <button
            type="button"
            className="add-player-button"
            onClick={handleOpenAddPlayer}
            aria-label="Add new player"
            title="Add a new player"
          >
            + Add Player
          </button>
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
              Sorted by{" "}
              {getSortTooltip(currentSortField)
                .replace("Click to sort by ", "")
                .replace("Currently sorted by ", "")}{" "}
              ({currentSortDirection})
            </div>

            {currentFilters.length > 0 && (
              <div className="filter-info">
                Filtered by:{" "}
                {currentFilters
                  .map(
                    (filter) =>
                      `${filter.field} ${filter.operator} ${filter.value}`
                  )
                  .join(", ")}
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
                🔽 Filters{" "}
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
              {visibleColumns.map((columnKey) => (
                <React.Fragment key={columnKey}>
                  {getColumnHeader(columnKey)}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="no-results">
                  {isSearchActive
                    ? "No players match your search criteria."
                    : "No players to display."}
                </td>
              </tr>
            ) : (
              players.map((player) => (
                <tr
                  key={player.id}
                  className={!player.active_status ? "retired-player" : ""}
                >
                  {visibleColumns.map((columnKey) => (
                    <td key={columnKey}>{getCellValue(player, columnKey)}</td>
                  ))}
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
        onEdit={handleEditPlayer}
        onDelete={handleDeletePlayer}
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
        initialVisibleColumns={visibleColumns}
        onColumnsChange={handleColumnsChange}
      />

      <PlayerFormModal
        isOpen={isAddPlayerModalOpen}
        onClose={handleCloseAddPlayer}
        onSuccess={handleAddPlayerSuccess}
        mode="add"
      />

      <PlayerFormModal
        isOpen={isEditPlayerModalOpen}
        onClose={handleCloseEditPlayer}
        onSuccess={handleEditPlayerSuccess}
        mode="edit"
        player={editingPlayer || undefined}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        player={deletingPlayer}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PlayersTable;
