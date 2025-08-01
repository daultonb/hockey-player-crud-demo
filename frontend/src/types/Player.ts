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
  goals: number;
  assists: number;
  points: number;
  active_status: boolean;
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
  | 'goals'
  | 'assists'
  | 'points'
  | 'active_status';

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
  { field: 'goals', label: 'Goals', displayName: 'Goals' },
  { field: 'assists', label: 'Assists', displayName: 'Assists' },
  { field: 'points', label: 'Points', displayName: 'Points' },
  { field: 'active_status', label: 'Status', displayName: 'Status' },
];

// Extended API response interface to include sorting info
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
}
