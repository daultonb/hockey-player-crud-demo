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
