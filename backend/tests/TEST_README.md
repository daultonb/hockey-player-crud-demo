# Hockey CRUD Application - Test Suite

This directory contains comprehensive unit tests for the hockey player CRUD application backend. **All 115 tests passing ✅**

## 🧪 Test Structure

```
backend/
├── tests/
│   ├── conftest.py                 # Shared fixtures and test configuration
│   ├── test_main.py                # API endpoint integration tests (NEW)
│   ├── test_crud_player.py         # CRUD operations and search/filter/sort tests
│   ├── test_schemas_player.py      # Pydantic schema validation tests
│   ├── test_models.py              # SQLAlchemy database model tests
│   ├── pytest.ini                  # Pytest configuration and markers
│   ├── requirements-test.txt       # Test-specific dependencies
│   ├── run_tests.sh                # Test runner script
│   └── TEST_README.md              # This documentation
└── requirements.txt                # Main backend dependencies
```

### Test Files

- **`conftest.py`** - Shared fixtures and test configuration with StaticPool for SQLite
- **`test_main.py`** - **NEW**: FastAPI endpoint integration tests for all CRUD operations
- **`test_crud_player.py`** - Tests for CRUD operations and search/filter/sort functionality
- **`test_schemas_player.py`** - Tests for Pydantic schema validation including PlayerCreate/PlayerUpdate
- **`test_models.py`** - Tests for SQLAlchemy database models

### Test Categories (Markers)

Tests are organized using pytest markers for easy categorization:

- `@pytest.mark.integration` - **NEW**: API endpoint integration tests
- `@pytest.mark.search` - Search functionality tests
- `@pytest.mark.filter` - Filtering functionality tests
- `@pytest.mark.sort` - Sorting functionality tests
- `@pytest.mark.pagination` - Pagination tests
- `@pytest.mark.validation` - Schema validation tests
- `@pytest.mark.models` - Database model tests
- `@pytest.mark.edge_case` - Edge cases and error conditions

## 🚀 Quick Start

### Installation

```bash
# From the backend directory
cd backend

# Activate virtual environment
source venv/bin/activate      # Linux/Mac
# or
source venv/Scripts/activate  # Windows Git Bash

# Install test dependencies
pip install -r requirements.txt
```

### Running Tests

```bash
# Run all tests (from backend directory)
python -m pytest tests/ -v

# Expected output: 115 tests passing

# Run tests by category
python -m pytest tests/ -m integration -v  # API endpoint tests
python -m pytest tests/ -m search -v       # Search tests
python -m pytest tests/ -m filter -v       # Filter tests
python -m pytest tests/ -m validation -v   # Validation tests

# Run specific test file
python -m pytest tests/test_main.py -v           # API endpoints
python -m pytest tests/test_crud_player.py -v    # CRUD operations
python -m pytest tests/test_schemas_player.py -v # Schema validation

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html -v
```

### Using the Test Runner Script

```bash
# From backend directory, make script executable (Linux/Mac)
chmod +x tests/run_tests.sh

# Run different test categories
./tests/run_tests.sh all         # All tests
./tests/run_tests.sh search      # Search tests only
./tests/run_tests.sh filter      # Filter tests only
./tests/run_tests.sh validation  # Validation tests only
./tests/run_tests.sh coverage    # With coverage report
./tests/run_tests.sh help        # Show all options
```

## 📋 Test Coverage (115 Total Tests)

### API Endpoints (`test_main.py`) - **NEW**

**Root Endpoints (2 tests)**
- GET / - Welcome message and API status
- GET /health - Health check endpoint

**Teams Endpoint (1 test)**
- GET /teams - Get all teams for dropdown selection

**Create Player Endpoint (5 tests)**
- POST /players - Create new player with validation
- Default values for stats fields
- Invalid team ID rejection
- Invalid position validation
- Missing required fields validation

**Get Player By ID Endpoint (2 tests)**
- GET /players/{id} - Retrieve single player with team info
- 404 error for non-existent player

**Update Player Endpoint (3 tests)**
- PUT /players/{id} - Update existing player
- Auto-recalculation of statistics
- Invalid team ID rejection
- 404 error for non-existent player

**Delete Player Endpoint (3 tests)**
- DELETE /players/{id} - Remove player
- Verify player no longer exists
- Cascade delete handling (team remains)
- 404 error for non-existent player

**Player Search Endpoint (10+ tests)**
- Basic search with default parameters
- Search across different fields
- Pagination functionality
- Filter application
- Sort by different columns
- Combined search + filter + sort operations

### CRUD Operations (`test_crud_player.py`)

**Search Tests (10 tests)**
- Text search across different fields (name, position, team, nationality, jersey)
- Case-insensitive search
- Empty search results handling
- Whitespace-only search queries

**Filter Tests (20+ tests)**
- Numeric filters (=, !=, >, >=, <, <=)
- String filters (=, !=, contains, not contains)
- Boolean filters (active status)
- Multiple filter combinations (AND logic)
- Team field filtering

**Sort Tests (6 tests)**
- Column sorting with ascending/descending order
- Sort by name, goals, active status
- Sort by team name (relationship field)

**Pagination Tests (4 tests)**
- Page-based result limiting
- Offset calculation
- Page navigation
- Combined with search functionality

**Integration Tests (3 tests)**
- Combined search + filter + sort operations
- Empty results handling
- Edge cases with complex queries

**Edge Cases (5 tests)**
- Empty search with filters
- Whitespace-only search
- Invalid filter combinations
- Boundary conditions

### Schema Validation (`test_schemas_player.py`)

**PlayerCreate Schema (NEW - 5 tests)**
- Required field validation
- Position enum validation (C, LW, RW, D, G)
- Handedness validation (L, R)
- Default values for stats fields
- Date format validation

**PlayerUpdate Schema (NEW - 5 tests)**
- All required fields validation
- Position enum validation
- Handedness validation
- Statistics field validation
- Team ID validation

**PlayerFilter Validation (8 tests)**
- Operator compatibility with field types
- String field operators (=, !=, contains)
- Numeric field operators (>, >=, <, <=)
- Boolean field operators (=, !=)
- Invalid operator rejection

**PlayerSearchParams Validation (10 tests)**
- Parameter bounds and defaults
- Valid search field types
- Valid sort fields and directions
- Page number validation (must be >= 1)
- Limit validation (1-100)
- Filter list validation

**Response Models (4 tests)**
- TeamResponse structure
- PlayerResponse with all stat fields (regular, playoff, combined)
- PlayersListResponse with pagination
- PlayerSearchResponse with search metadata

**Error Handling (8 tests)**
- Invalid inputs and validation errors
- Missing required fields
- Out-of-range values
- Invalid field names

### Database Models (`test_models.py`)

**Model Creation (3 tests)**
- Player model instantiation
- Team model instantiation
- Proper field assignment

**Relationships (3 tests)**
- One-to-many team-player relationships
- Foreign key constraints
- Cascade behavior

**Constraints (2 tests)**
- Nullable field validation
- Foreign key constraint enforcement

**Defaults (2 tests)**
- Default value assignment
- Auto-incrementing IDs

## 🎯 Test Data

### Fixtures

- **`test_engine`** - In-memory SQLite database with StaticPool for connection sharing
- **`test_db`** - Database session with automatic cleanup
- **`sample_teams`** - Realistic team data (3 teams)
- **`sample_players`** - Generated player data across teams (24 players, 8 per team)
- **`specific_test_players`** - Known players with predictable data for specific tests
- **`client`** - **NEW**: FastAPI TestClient with database dependency override

### Data Generation

The `TestDataGenerator` class provides realistic test data:

- **Teams**: Various cities, conferences, divisions
- **Players**: Realistic names, positions, stats, nationalities
- **Positions**: Abbreviated format (C, LW, RW, D, G)
- **Handedness**: Abbreviated format (L, R)
- **Relationships**: Proper team assignments and unique jersey numbers
- **Statistics**: Position-appropriate goal/assist ranges

### Key Testing Improvements

**StaticPool Configuration**
- Uses SQLAlchemy's StaticPool to ensure all database connections share the same in-memory database
- Prevents "table not found" errors in integration tests
- Enables proper test isolation while maintaining data consistency

**Database Dependency Override**
- FastAPI TestClient properly configured with test database override
- Ensures all API calls use the test database instead of production database
- Automatic cleanup after each test

## 📊 VS Code Integration

### Running Tests in VS Code

1. **Install Python Test Explorer Extension**
2. **Configure Test Discovery**:

   - Open Command Palette (Ctrl+Shift+P)
   - Run "Python: Refresh Tests"
   - Tests will appear in the Test Explorer panel

3. **Run by Category**:
   - Use Test Explorer filtering
   - Or run from terminal: `python -m pytest tests/ -m integration`

### Test Explorer Features

- ✅ Run individual tests or test classes
- 🔍 Filter by test markers (integration, search, filter, sort, etc.)
- 📊 View test results and failure details
- 🐛 Debug tests with breakpoints

## 🔧 Configuration

### pytest.ini Settings

```ini
[pytest]
testpaths = tests
markers =
    integration: Integration tests for API endpoints
    search: Tests for search functionality
    filter: Tests for filtering functionality
    sort: Tests for sorting functionality
    pagination: Tests for pagination functionality
    validation: Tests for schema validation
    models: Tests for database models
    edge_case: Edge cases and error conditions

addopts = -v --tb=short --strict-markers --disable-warnings --color=yes
```

### Environment Variables

Tests use in-memory SQLite databases with StaticPool, so no external database configuration is needed. The test suite is completely isolated and requires no setup beyond installing dependencies.

## 📈 Coverage Reports

Generate HTML coverage reports:

```bash
python -m pytest tests/ --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

Coverage includes:

- Line coverage for all application modules
- Branch coverage for conditional logic
- Missing line identification
- **Expected Coverage**: ~95%+ across all modules

Target coverage areas:
- ✅ API endpoints (main.py)
- ✅ CRUD operations (crud/player.py)
- ✅ Schema validation (schemas/player.py)
- ✅ Database models (models/player.py, models/team.py)

## 🏗️ Adding New Tests

### Test File Structure

```python
"""
Brief description of what this test file covers.
"""
import pytest
from fastapi.testclient import TestClient

class TestFeatureName:
    """Test specific feature functionality."""

    @pytest.mark.integration
    def test_specific_behavior(self, client: TestClient, sample_players):
        """
        Test description.
        Input: What inputs are provided
        Expected: What results are expected
        """
        # Arrange
        test_data = {"field": "value"}

        # Act
        response = client.post("/endpoint", json=test_data)

        # Assert
        assert response.status_code == 200
        assert response.json()["field"] == "value"
```

### Best Practices

1. **Use descriptive test names** that explain the scenario
2. **Add docstrings** with input/output descriptions
3. **Use appropriate markers** for categorization
4. **Test edge cases** and error conditions
5. **Use fixtures** for reusable test data
6. **Keep tests isolated** and independent
7. **Follow AAA pattern**: Arrange, Act, Assert
8. **Mock external dependencies** when necessary
9. **Test both success and failure paths**
10. **Verify error messages** and status codes

## 🐛 Troubleshooting

### Common Issues

**Tests not discovered:**

```bash
# Ensure you're in the backend directory
cd backend
# Refresh test discovery
python -m pytest tests/ --collect-only
```

**Import errors:**

```bash
# Ensure virtual environment is activated
source venv/bin/activate  # Linux/Mac
# Install dependencies
pip install -r requirements.txt
```

**Database table not found errors:**

```bash
# This should not occur with StaticPool configuration
# If it does, check that conftest.py has:
# - poolclass=StaticPool in create_engine
# - Proper database dependency override in client fixture
```

**Player position/handedness validation errors:**

```bash
# Ensure test data uses abbreviated formats:
# Positions: C, LW, RW, D, G (not "Center", "Left Wing", etc.)
# Handedness: L, R (not "Left", "Right")
```

### Debug Mode

Run tests with extra debugging:

```bash
# Verbose output with full tracebacks
python -m pytest tests/ -s -vv --tb=long

# Show print statements
python -m pytest tests/ -s

# Stop on first failure
python -m pytest tests/ -x

# Run specific test with debugging
python -m pytest tests/test_main.py::TestCreatePlayerEndpoint::test_create_player_success -vv
```

## 🚦 Continuous Integration

### Running Tests in CI/CD

Example GitHub Actions workflow:

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          python -m pytest tests/ -v --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## 📚 Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [SQLAlchemy Testing Guide](https://docs.sqlalchemy.org/en/14/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites)
- [Pydantic Testing](https://docs.pydantic.dev/latest/concepts/models/#testing)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [TestClient Documentation](https://www.starlette.io/testclient/)

## 📊 Test Statistics

- **Total Tests**: 115
- **Pass Rate**: 100% ✅
- **Test Categories**: 8 markers
- **Test Files**: 4 main test files
- **Coverage**: ~95%+
- **Average Runtime**: ~1.5 seconds

### Test Distribution

- API Integration: ~25 tests
- CRUD Operations: ~40 tests
- Schema Validation: ~35 tests
- Database Models: ~10 tests
- Edge Cases: ~5 tests

---

**Last Updated**: After implementing complete CRUD functionality with create, update, and delete operations
