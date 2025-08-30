/**
 *  @fileoverview Comprehensive test suite for Player Types and Constants
 *
 * Tests all interfaces, types, and constants defined in Player.ts
 * Ensures type safety and data integrity across the application
 *
 * Test Tags:
 * - @types: Type definition tests
 * - @constants: Constant array tests
 * - @interfaces: Interface structure tests
 * - @validation: Data validation tests
 */

import {
  BOOLEAN_OPTIONS,
  BooleanFilterOperator,
  FILTERABLE_FIELDS,
  FilterDataType,
  FilterField,
  FilterOperator,
  NumericFilterOperator,
  OPERATOR_LABELS,
  Player,
  PlayerFilter,
  PlayersApiResponse,
  PlayersResponse,
  SEARCHABLE_FIELDS,
  SearchConfig,
  SearchField,
  SORTABLE_FIELDS,
  SortConfig,
  SortDirection,
  SortField,
  StringFilterOperator,
  Team,
} from '../types/Player';

describe('Player Types and Constants', () => {
  /**
   * Test Team interface structure and properties
   * Validates that Team objects have correct shape and types
   */
  describe('@interfaces Team Interface', () => {
    it('should have correct Team interface structure', () => {
      const mockTeam: Team = {
        id: 1,
        name: 'Toronto Maple Leafs',
        city: 'Toronto',
      };

      expect(typeof mockTeam.id).toBe('number');
      expect(typeof mockTeam.name).toBe('string');
      expect(typeof mockTeam.city).toBe('string');
      expect(Object.keys(mockTeam)).toHaveLength(3);
    });

    it('should allow valid Team object creation', () => {
      const team: Team = {
        id: 999,
        name: 'Test Team',
        city: 'Test City',
      };

      expect(team).toBeDefined();
      expect(team.id).toBe(999);
      expect(team.name).toBe('Test Team');
      expect(team.city).toBe('Test City');
    });
  });

  /**
   * Test Player interface structure and properties
   * Validates complete Player object with all required fields
   */
  describe('@interfaces Player Interface', () => {
    let mockPlayer: Player;

    beforeEach(() => {
      mockPlayer = {
        id: 1,
        name: 'Connor McDavid',
        position: 'C',
        nationality: 'Canada',
        jersey_number: 97,
        birth_date: '1997-01-13',
        height: '6\'1"',
        weight: 193,
        handedness: 'L',
        goals: 64,
        assists: 89,
        points: 153,
        active_status: true,
        team: {
          id: 1,
          name: 'Edmonton Oilers',
          city: 'Edmonton',
        },
      };
    });

    it('should have correct Player interface structure', () => {
      expect(typeof mockPlayer.id).toBe('number');
      expect(typeof mockPlayer.name).toBe('string');
      expect(typeof mockPlayer.position).toBe('string');
      expect(typeof mockPlayer.nationality).toBe('string');
      expect(typeof mockPlayer.jersey_number).toBe('number');
      expect(typeof mockPlayer.birth_date).toBe('string');
      expect(typeof mockPlayer.height).toBe('string');
      expect(typeof mockPlayer.weight).toBe('number');
      expect(typeof mockPlayer.handedness).toBe('string');
      expect(typeof mockPlayer.goals).toBe('number');
      expect(typeof mockPlayer.assists).toBe('number');
      expect(typeof mockPlayer.points).toBe('number');
      expect(typeof mockPlayer.active_status).toBe('boolean');
      expect(typeof mockPlayer.team).toBe('object');
      expect(Object.keys(mockPlayer)).toHaveLength(14);
    });

    it('should have valid nested Team object', () => {
      expect(mockPlayer.team).toBeDefined();
      expect(typeof mockPlayer.team.id).toBe('number');
      expect(typeof mockPlayer.team.name).toBe('string');
      expect(typeof mockPlayer.team.city).toBe('string');
    });

    it('should allow retired player creation', () => {
      const retiredPlayer: Player = {
        ...mockPlayer,
        active_status: false,
      };

      expect(retiredPlayer.active_status).toBe(false);
      expect(retiredPlayer).toBeDefined();
    });
  });

  /**
   * Test PlayersResponse interface for API responses
   * Validates structure of paginated player data responses
   */
  describe('@interfaces PlayersResponse Interface', () => {
    it('should have correct PlayersResponse interface structure', () => {
      const mockResponse: PlayersResponse = {
        players: [],
        count: 0,
      };

      expect(Array.isArray(mockResponse.players)).toBe(true);
      expect(typeof mockResponse.count).toBe('number');
      expect(Object.keys(mockResponse)).toHaveLength(2);
    });

    it('should allow PlayersResponse with player data', () => {
      const mockPlayer: Player = {
        id: 1,
        name: 'Test Player',
        position: 'C',
        nationality: 'Canada',
        jersey_number: 1,
        birth_date: '2000-01-01',
        height: '6\'0"',
        weight: 200,
        handedness: 'R',
        goals: 10,
        assists: 15,
        points: 25,
        active_status: true,
        team: { id: 1, name: 'Test Team', city: 'Test City' },
      };

      const response: PlayersResponse = {
        players: [mockPlayer],
        count: 1,
      };

      expect(response.players).toHaveLength(1);
      expect(response.count).toBe(1);
      expect(response.players[0]).toEqual(mockPlayer);
    });
  });

  /**
   * Test SearchField and SearchConfig types
   * Validates search functionality type definitions
   */
  describe('@types Search Types', () => {
    it('should validate SearchField type values', () => {
      const validSearchFields: SearchField[] = [
        'all',
        'name',
        'position',
        'team',
        'nationality',
        'jersey_number',
      ];

      validSearchFields.forEach(field => {
        expect(typeof field).toBe('string');
      });
    });

    it('should have correct SearchConfig interface structure', () => {
      const mockSearchConfig: SearchConfig = {
        value: 'name',
        label: 'Name',
        searchKey: 'name',
      };

      expect(typeof mockSearchConfig.value).toBe('string');
      expect(typeof mockSearchConfig.label).toBe('string');
      expect(typeof mockSearchConfig.searchKey).toBe('string');
    });

    it('should allow SearchConfig without searchKey', () => {
      const configWithoutKey: SearchConfig = {
        value: 'all',
        label: 'All Fields',
      };

      expect(configWithoutKey.searchKey).toBeUndefined();
      expect(configWithoutKey.value).toBe('all');
      expect(configWithoutKey.label).toBe('All Fields');
    });
  });

  /**
   * Test SEARCHABLE_FIELDS constant array
   * Validates search configuration data integrity
   */
  describe('@constants SEARCHABLE_FIELDS', () => {
    it('should have correct number of searchable fields', () => {
      expect(SEARCHABLE_FIELDS).toHaveLength(6);
    });

    it('should have all required searchable field configurations', () => {
      const expectedFields = [
        'all',
        'name',
        'position',
        'team',
        'nationality',
        'jersey_number',
      ];
      const actualFields = SEARCHABLE_FIELDS.map(field => field.value);

      expect(actualFields).toEqual(expectedFields);
    });

    it('should have proper structure for each searchable field', () => {
      SEARCHABLE_FIELDS.forEach(field => {
        expect(field).toHaveProperty('value');
        expect(field).toHaveProperty('label');
        expect(typeof field.value).toBe('string');
        expect(typeof field.label).toBe('string');
      });
    });

    it('should have searchKey for specific fields', () => {
      const fieldsWithSearchKey = SEARCHABLE_FIELDS.filter(
        field => field.searchKey
      );
      expect(fieldsWithSearchKey).toHaveLength(5); // All except 'all'

      const allField = SEARCHABLE_FIELDS.find(field => field.value === 'all');
      expect(allField?.searchKey).toBeUndefined();
    });

    it('should have team.name as searchKey for team field', () => {
      const teamField = SEARCHABLE_FIELDS.find(field => field.value === 'team');
      expect(teamField?.searchKey).toBe('team.name');
    });
  });

  /**
   * Test Sort types and configurations
   * Validates sorting functionality type definitions
   */
  describe('@types Sort Types', () => {
    it('should validate SortField type values', () => {
      const validSortFields: SortField[] = [
        'name',
        'position',
        'team',
        'jersey_number',
        'goals',
        'assists',
        'points',
        'active_status',
      ];

      validSortFields.forEach(field => {
        expect(typeof field).toBe('string');
      });
    });

    it('should validate SortDirection type values', () => {
      const validDirections: SortDirection[] = ['asc', 'desc'];

      validDirections.forEach(direction => {
        expect(typeof direction).toBe('string');
        expect(['asc', 'desc']).toContain(direction);
      });
    });

    it('should have correct SortConfig interface structure', () => {
      const mockSortConfig: SortConfig = {
        field: 'name',
        label: 'Name',
        displayName: 'Name',
      };

      expect(typeof mockSortConfig.field).toBe('string');
      expect(typeof mockSortConfig.label).toBe('string');
      expect(typeof mockSortConfig.displayName).toBe('string');
      expect(Object.keys(mockSortConfig)).toHaveLength(3);
    });
  });

  /**
   * Test SORTABLE_FIELDS constant array
   * Validates sort configuration data integrity
   */
  describe('@constants SORTABLE_FIELDS', () => {
    it('should have correct number of sortable fields', () => {
      expect(SORTABLE_FIELDS).toHaveLength(8);
    });

    it('should have all required sortable field configurations', () => {
      const expectedFields = [
        'name',
        'position',
        'team',
        'jersey_number',
        'goals',
        'assists',
        'points',
        'active_status',
      ];
      const actualFields = SORTABLE_FIELDS.map(field => field.field);

      expect(actualFields).toEqual(expectedFields);
    });

    it('should have proper structure for each sortable field', () => {
      SORTABLE_FIELDS.forEach(field => {
        expect(field).toHaveProperty('field');
        expect(field).toHaveProperty('label');
        expect(field).toHaveProperty('displayName');
        expect(typeof field.field).toBe('string');
        expect(typeof field.label).toBe('string');
        expect(typeof field.displayName).toBe('string');
      });
    });

    it('should have meaningful display names', () => {
      const jerseyField = SORTABLE_FIELDS.find(
        field => field.field === 'jersey_number'
      );
      expect(jerseyField?.label).toBe('Jersey #');
      expect(jerseyField?.displayName).toBe('Jersey #');
    });
  });

  /**
   * Test Filter types and operator definitions
   * Validates filtering functionality type definitions
   */
  describe('@types Filter Types', () => {
    it('should validate FilterField type values', () => {
      const validFilterFields: FilterField[] = [
        'position',
        'team',
        'jersey_number',
        'goals',
        'assists',
        'points',
        'active_status',
      ];

      validFilterFields.forEach(field => {
        expect(typeof field).toBe('string');
      });
    });

    it('should validate StringFilterOperator type values', () => {
      const validOperators: StringFilterOperator[] = [
        '=',
        '!=',
        'contains',
        'not_contains',
      ];

      validOperators.forEach(operator => {
        expect(typeof operator).toBe('string');
      });
    });

    it('should validate NumericFilterOperator type values', () => {
      const validOperators: NumericFilterOperator[] = [
        '=',
        '!=',
        '>',
        '<',
        '>=',
        '<=',
      ];

      validOperators.forEach(operator => {
        expect(typeof operator).toBe('string');
      });
    });

    it('should validate BooleanFilterOperator type values', () => {
      const validOperators: BooleanFilterOperator[] = ['=', '!='];

      validOperators.forEach(operator => {
        expect(typeof operator).toBe('string');
      });
    });

    it('should validate FilterDataType type values', () => {
      const validDataTypes: FilterDataType[] = ['string', 'numeric', 'boolean'];

      validDataTypes.forEach(dataType => {
        expect(typeof dataType).toBe('string');
      });
    });
  });

  /**
   * Test FILTERABLE_FIELDS constant array
   * Validates filter configuration data integrity and operator mappings
   */
  describe('@constants FILTERABLE_FIELDS', () => {
    it('should have correct number of filterable fields', () => {
      expect(FILTERABLE_FIELDS).toHaveLength(7);
    });

    it('should have all required filterable field configurations', () => {
      const expectedFields = [
        'position',
        'team',
        'jersey_number',
        'goals',
        'assists',
        'points',
        'active_status',
      ];
      const actualFields = FILTERABLE_FIELDS.map(field => field.field);

      expect(actualFields).toEqual(expectedFields);
    });

    it('should have proper structure for each filterable field', () => {
      FILTERABLE_FIELDS.forEach(field => {
        expect(field).toHaveProperty('field');
        expect(field).toHaveProperty('label');
        expect(field).toHaveProperty('displayName');
        expect(field).toHaveProperty('dataType');
        expect(field).toHaveProperty('operators');
        expect(Array.isArray(field.operators)).toBe(true);
        expect(field.operators.length).toBeGreaterThan(0);
      });
    });

    it('should have correct operators for string fields', () => {
      const stringFields = FILTERABLE_FIELDS.filter(
        field => field.dataType === 'string'
      );

      stringFields.forEach(field => {
        expect(field.operators).toEqual([
          '=',
          '!=',
          'contains',
          'not_contains',
        ]);
      });
    });

    it('should have correct operators for numeric fields', () => {
      const numericFields = FILTERABLE_FIELDS.filter(
        field => field.dataType === 'numeric'
      );

      numericFields.forEach(field => {
        expect(field.operators).toEqual(['=', '!=', '>', '<', '>=', '<=']);
      });
    });

    it('should have correct operators for boolean fields', () => {
      const booleanFields = FILTERABLE_FIELDS.filter(
        field => field.dataType === 'boolean'
      );

      booleanFields.forEach(field => {
        expect(field.operators).toEqual(['=', '!=']);
      });
    });

    it('should classify data types correctly', () => {
      const stringFields = ['position', 'team'];
      const numericFields = ['jersey_number', 'goals', 'assists', 'points'];
      const booleanFields = ['active_status'];

      stringFields.forEach(fieldName => {
        const field = FILTERABLE_FIELDS.find(f => f.field === fieldName);
        expect(field?.dataType).toBe('string');
      });

      numericFields.forEach(fieldName => {
        const field = FILTERABLE_FIELDS.find(f => f.field === fieldName);
        expect(field?.dataType).toBe('numeric');
      });

      booleanFields.forEach(fieldName => {
        const field = FILTERABLE_FIELDS.find(f => f.field === fieldName);
        expect(field?.dataType).toBe('boolean');
      });
    });
  });

  /**
   * Test PlayerFilter interface and related structures
   * Validates filter object creation and structure
   */
  describe('@interfaces PlayerFilter Interface', () => {
    it('should have correct PlayerFilter interface structure', () => {
      const mockFilter: PlayerFilter = {
        field: 'goals',
        operator: '>',
        value: 30,
      };

      expect(typeof mockFilter.field).toBe('string');
      expect(typeof mockFilter.operator).toBe('string');
      expect(typeof mockFilter.value).toBe('number');
      expect(Object.keys(mockFilter)).toHaveLength(3);
    });

    it('should allow string filter values', () => {
      const stringFilter: PlayerFilter = {
        field: 'position',
        operator: 'contains',
        value: 'Center',
      };

      expect(typeof stringFilter.value).toBe('string');
      expect(stringFilter.field).toBe('position');
      expect(stringFilter.operator).toBe('contains');
    });

    it('should allow boolean filter values', () => {
      const booleanFilter: PlayerFilter = {
        field: 'active_status',
        operator: '=',
        value: true,
      };

      expect(typeof booleanFilter.value).toBe('boolean');
      expect(booleanFilter.field).toBe('active_status');
      expect(booleanFilter.operator).toBe('=');
    });
  });

  /**
   * Test OPERATOR_LABELS constant mapping
   * Validates operator display labels for UI
   */
  describe('@constants OPERATOR_LABELS', () => {
    it('should have labels for all filter operators', () => {
      const expectedOperators = [
        '=',
        '!=',
        'contains',
        'not_contains',
        '>',
        '<',
        '>=',
        '<=',
      ];

      expectedOperators.forEach(operator => {
        expect(OPERATOR_LABELS).toHaveProperty(operator);
        expect(typeof OPERATOR_LABELS[operator as FilterOperator]).toBe(
          'string'
        );
        expect(
          OPERATOR_LABELS[operator as FilterOperator].length
        ).toBeGreaterThan(0);
      });
    });

    it('should have meaningful label descriptions', () => {
      expect(OPERATOR_LABELS['=']).toBe('equals');
      expect(OPERATOR_LABELS['!=']).toBe('does not equal');
      expect(OPERATOR_LABELS['contains']).toBe('contains');
      expect(OPERATOR_LABELS['not_contains']).toBe('does not contain');
      expect(OPERATOR_LABELS['>']).toBe('greater than');
      expect(OPERATOR_LABELS['<']).toBe('less than');
      expect(OPERATOR_LABELS['>=']).toBe('greater than or equal to');
      expect(OPERATOR_LABELS['<=']).toBe('less than or equal to');
    });

    it('should have correct number of operator labels', () => {
      expect(Object.keys(OPERATOR_LABELS)).toHaveLength(8);
    });
  });

  /**
   * Test BOOLEAN_OPTIONS constant array
   * Validates boolean field options for active_status
   */
  describe('@constants BOOLEAN_OPTIONS', () => {
    it('should have correct number of boolean options', () => {
      expect(BOOLEAN_OPTIONS).toHaveLength(2);
    });

    it('should have correct boolean option structure', () => {
      BOOLEAN_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('boolean');
        expect(typeof option.label).toBe('string');
      });
    });

    it('should have correct active and retired options', () => {
      const activeOption = BOOLEAN_OPTIONS.find(
        option => option.value === true
      );
      const retiredOption = BOOLEAN_OPTIONS.find(
        option => option.value === false
      );

      expect(activeOption?.label).toBe('Active');
      expect(retiredOption?.label).toBe('Retired');
    });

    it('should cover both boolean values', () => {
      const values = BOOLEAN_OPTIONS.map(option => option.value);
      expect(values).toContain(true);
      expect(values).toContain(false);
    });
  });

  /**
   * Test PlayersApiResponse interface for extended API responses
   * Validates complete API response structure with pagination and filters
   */
  describe('@interfaces PlayersApiResponse Interface', () => {
    let mockApiResponse: PlayersApiResponse;

    beforeEach(() => {
      mockApiResponse = {
        players: [],
        count: 0,
        total: 100,
        page: 1,
        limit: 20,
        total_pages: 5,
        search_query: null,
        search_field: 'all',
        sort_by: 'name',
        sort_order: 'asc',
        filters: [],
      };
    });

    it('should have correct PlayersApiResponse interface structure', () => {
      expect(Array.isArray(mockApiResponse.players)).toBe(true);
      expect(typeof mockApiResponse.count).toBe('number');
      expect(typeof mockApiResponse.total).toBe('number');
      expect(typeof mockApiResponse.page).toBe('number');
      expect(typeof mockApiResponse.limit).toBe('number');
      expect(typeof mockApiResponse.total_pages).toBe('number');
      expect(
        mockApiResponse.search_query === null ||
          typeof mockApiResponse.search_query === 'string'
      ).toBe(true);
      expect(typeof mockApiResponse.search_field).toBe('string');
      expect(typeof mockApiResponse.sort_by).toBe('string');
      expect(typeof mockApiResponse.sort_order).toBe('string');
      expect(Array.isArray(mockApiResponse.filters)).toBe(true);
      expect(Object.keys(mockApiResponse)).toHaveLength(11);
    });

    it('should allow PlayersApiResponse with search query', () => {
      const responseWithSearch: PlayersApiResponse = {
        ...mockApiResponse,
        search_query: 'McDavid',
        search_field: 'name',
      };

      expect(responseWithSearch.search_query).toBe('McDavid');
      expect(responseWithSearch.search_field).toBe('name');
    });

    it('should allow PlayersApiResponse with filters', () => {
      const responseWithFilters: PlayersApiResponse = {
        ...mockApiResponse,
        filters: [
          { field: 'goals', operator: '>', value: 30 },
          { field: 'active_status', operator: '=', value: true },
        ],
      };

      expect(responseWithFilters.filters).toHaveLength(2);
      expect(responseWithFilters.filters[0].field).toBe('goals');
      expect(responseWithFilters.filters[1].field).toBe('active_status');
    });

    it('should allow different sort configurations', () => {
      const responseWithSort: PlayersApiResponse = {
        ...mockApiResponse,
        sort_by: 'points',
        sort_order: 'desc',
      };

      expect(responseWithSort.sort_by).toBe('points');
      expect(responseWithSort.sort_order).toBe('desc');
    });
  });

  /**
   * Test data integrity and cross-validation
   * Validates consistency between related constants and types
   */
  describe('@validation Data Integrity', () => {
    it('should have consistent field names across search, sort, and filter configs', () => {
      // Check that overlapping fields have consistent naming
      const searchableTeam = SEARCHABLE_FIELDS.find(f => f.value === 'team');
      const sortableTeam = SORTABLE_FIELDS.find(f => f.field === 'team');
      const filterableTeam = FILTERABLE_FIELDS.find(f => f.field === 'team');

      expect(searchableTeam?.label).toBe('Team');
      expect(sortableTeam?.label).toBe('Team');
      expect(filterableTeam?.label).toBe('Team');
    });

    it('should have no duplicate field values in configuration arrays', () => {
      const searchValues = SEARCHABLE_FIELDS.map(f => f.value);
      const sortFields = SORTABLE_FIELDS.map(f => f.field);
      const filterFields = FILTERABLE_FIELDS.map(f => f.field);

      expect(new Set(searchValues).size).toBe(searchValues.length);
      expect(new Set(sortFields).size).toBe(sortFields.length);
      expect(new Set(filterFields).size).toBe(filterFields.length);
    });

    it('should have valid operator mappings for all data types', () => {
      const stringOperators = ['=', '!=', 'contains', 'not_contains'];
      const numericOperators = ['=', '!=', '>', '<', '>=', '<='];
      const booleanOperators = ['=', '!='];

      // Verify all operators exist in OPERATOR_LABELS
      [...stringOperators, ...numericOperators, ...booleanOperators].forEach(
        operator => {
          expect(OPERATOR_LABELS).toHaveProperty(operator);
        }
      );
    });

    it('should maintain consistency in jersey number field naming', () => {
      const searchJersey = SEARCHABLE_FIELDS.find(
        f => f.value === 'jersey_number'
      );
      const sortJersey = SORTABLE_FIELDS.find(f => f.field === 'jersey_number');
      const filterJersey = FILTERABLE_FIELDS.find(
        f => f.field === 'jersey_number'
      );

      expect(searchJersey?.label).toBe('Jersey Number');
      expect(sortJersey?.label).toBe('Jersey #');
      expect(filterJersey?.label).toBe('Jersey #');

      // All should reference the same underlying field
      expect(searchJersey?.searchKey).toBe('jersey_number');
      expect(sortJersey?.field).toBe('jersey_number');
      expect(filterJersey?.field).toBe('jersey_number');
    });
  });
});
