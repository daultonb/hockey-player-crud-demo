export interface Team {
  id: number;
  name: string;
  city: string;
}

export interface Player {
  id: number;
  name: string;
  position: string;
  nationality: string;
  jersey_number: number;
  birth_date: string;
  height: string;
  weight: number;
  handedness: string;
  active_status: boolean;

  // Regular season statistics
  regular_season_goals: number;
  regular_season_assists: number;
  regular_season_points: number;
  regular_season_games_played: number;

  // Playoff statistics
  playoff_goals: number;
  playoff_assists: number;
  playoff_points: number;
  playoff_games_played: number;
  // Combined statistics
  games_played: number;
  goals: number;
  assists: number;
  points: number;

  team: Team;
}

export interface PlayersResponse {
  players: Player[];
  count: number;
}

export type SearchField =
  | 'all'
  | 'name'
  | 'position'
  | 'team'
  | 'nationality'
  | 'jersey_number';

export interface SearchConfig {
  value: SearchField;
  label: string;
  searchKey?: keyof Player | 'team.name';
}

export const SEARCHABLE_FIELDS: SearchConfig[] = [
  { value: 'all', label: 'All Fields' },
  { value: 'name', label: 'Name', searchKey: 'name' },
  { value: 'position', label: 'Position', searchKey: 'position' },
  { value: 'team', label: 'Team', searchKey: 'team.name' },
  { value: 'nationality', label: 'Nationality', searchKey: 'nationality' },
  {
    value: 'jersey_number',
    label: 'Jersey Number',
    searchKey: 'jersey_number',
  },
];

// Sort field type - matches backend SortFieldType
export type SortField =
  | 'name'
  | 'position'
  | 'team'
  | 'jersey_number'
  | 'active_status'
  | 'regular_season_goals'
  | 'regular_season_assists'
  | 'regular_season_points'
  | 'regular_season_games_played'
  | 'playoff_goals'
  | 'playoff_assists'
  | 'playoff_points'
  | 'playoff_games_played'
  | 'games_played'
  | 'goals'
  | 'assists'
  | 'points';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  label: string;
  displayName: string;
}

export const SORTABLE_FIELDS: SortConfig[] = [
  { field: 'name', label: 'Name', displayName: 'Name' },
  { field: 'position', label: 'Position', displayName: 'Position' },
  { field: 'team', label: 'Team', displayName: 'Team' },
  { field: 'jersey_number', label: 'Jersey #', displayName: 'Jersey #' },
  { field: 'active_status', label: 'Status', displayName: 'Status' },
  {
    field: 'regular_season_goals',
    label: 'RS Goals',
    displayName: 'Regular Season Goals',
  },
  {
    field: 'regular_season_assists',
    label: 'RS Assists',
    displayName: 'Regular Season Assists',
  },
  {
    field: 'regular_season_points',
    label: 'RS Points',
    displayName: 'Regular Season Points',
  },
  {
    field: 'regular_season_games_played',
    label: 'RS Games',
    displayName: 'Regular Season Games',
  },
  { field: 'playoff_goals', label: 'PO Goals', displayName: 'Playoff Goals' },
  {
    field: 'playoff_assists',
    label: 'PO Assists',
    displayName: 'Playoff Assists',
  },
  {
    field: 'playoff_points',
    label: 'PO Points',
    displayName: 'Playoff Points',
  },
  {
    field: 'playoff_games_played',
    label: 'PO Games',
    displayName: 'Playoff Games',
  },
  {
    field: 'games_played',
    label: 'Games Played (Total)',
    displayName: 'Games Played (Total)',
  },
  {
    field: 'goals',
    label: 'Goals (Total)',
    displayName: 'Goals (Total)',
  },
  {
    field: 'assists',
    label: 'Assists (Total)',
    displayName: 'Assists (Total)',
  },
  { field: 'points', label: 'Points (Total)', displayName: 'Points (Total)' },
];

// Filter types - matches backend FilterFieldType
export type FilterField =
  | 'position'
  | 'team'
  | 'jersey_number'
  | 'active_status'
  | 'regular_season_goals'
  | 'regular_season_assists'
  | 'regular_season_points'
  | 'regular_season_games_played'
  | 'playoff_goals'
  | 'playoff_assists'
  | 'playoff_points'
  | 'playoff_games_played'
  | 'games_played'
  | 'goals'
  | 'assists'
  | 'points';

// Filter operator types
export type StringFilterOperator = '=' | '!=' | 'contains' | 'not_contains';
export type NumericFilterOperator = '=' | '!=' | '>' | '<' | '>=' | '<=';
export type BooleanFilterOperator = '=' | '!=';
export type FilterOperator =
  | StringFilterOperator
  | NumericFilterOperator
  | BooleanFilterOperator;

// Filter data type classification
export type FilterDataType = 'string' | 'numeric' | 'boolean';

export interface FilterConfig {
  field: FilterField;
  label: string;
  displayName: string;
  dataType: FilterDataType;
  operators: FilterOperator[];
}

export const FILTERABLE_FIELDS: FilterConfig[] = [
  {
    field: 'position',
    label: 'Position',
    displayName: 'Position',
    dataType: 'string',
    operators: ['=', '!=', 'contains', 'not_contains'],
  },
  {
    field: 'team',
    label: 'Team',
    displayName: 'Team',
    dataType: 'string',
    operators: ['=', '!=', 'contains', 'not_contains'],
  },
  {
    field: 'jersey_number',
    label: 'Jersey #',
    displayName: 'Jersey #',
    dataType: 'numeric',
    operators: ['=', '!=', '>', '<', '>=', '<='],
  },
  {
    field: 'goals',
    label: 'Goals',
    displayName: 'Goals',
    dataType: 'numeric',
    operators: ['=', '!=', '>', '<', '>=', '<='],
  },
  {
    field: 'assists',
    label: 'Assists',
    displayName: 'Assists',
    dataType: 'numeric',
    operators: ['=', '!=', '>', '<', '>=', '<='],
  },
  {
    field: 'points',
    label: 'Points',
    displayName: 'Points',
    dataType: 'numeric',
    operators: ['=', '!=', '>', '<', '>=', '<='],
  },
  {
    field: 'active_status',
    label: 'Status',
    displayName: 'Status',
    dataType: 'boolean',
    operators: ['=', '!='],
  },
];

// Filter interface
export interface PlayerFilter {
  field: FilterField;
  operator: FilterOperator;
  value: string | number | boolean;
}

// Operator display labels
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  '=': 'equals',
  '!=': 'does not equal',
  contains: 'contains',
  not_contains: 'does not contain',
  '>': 'greater than',
  '<': 'less than',
  '>=': 'greater than or equal to',
  '<=': 'less than or equal to',
};

// Boolean value options for active_status
export const BOOLEAN_OPTIONS = [
  { value: true, label: 'Active' },
  { value: false, label: 'Retired' },
];

// Extended API response including sorting and filtering info
export interface PlayersApiResponse {
  players: Player[];
  count: number;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  search_query: string | null;
  search_field: SearchField;
  sort_by: SortField;
  sort_order: SortDirection;
  filters: PlayerFilter[];
}
