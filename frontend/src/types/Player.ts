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

// Filter types - matches backend FilterFieldType
export type FilterField =
  | 'position'
  | 'team'
  | 'jersey_number'
  | 'goals'
  | 'assists'
  | 'points'
  | 'active_status';

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
