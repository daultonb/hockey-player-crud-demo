# Hockey CRUD Application - Test Suite

This directory contains comprehensive unit tests for the hockey player CRUD application backend.

## 🧪 Test Structure

```
backend/
├── tests/
│   ├── conftest.py                 # Shared fixtures and test configuration
│   ├── test_crud_player.py         # CRUD operations and search/filter/sort tests
│   ├── test_schemas_player.py      # Pydantic schema validation tests
│   ├── test_models.py              # SQLAlchemy database model tests
│   ├── pytest.ini                 # Pytest configuration and markers
│   ├── requirements-test.txt       # Test-specific dependencies
│   ├── run_tests.sh               # Test runner script
│   └── TEST_README.md             # This documentation
└── requirements.txt               # Main backend dependencies
```

### Test Files

- **`conftest.py`** - Shared fixtures and test configuration
- **`test_crud_player.py`** - Tests for CRUD operations and search/filter/sort functionality
- **`test_schemas_player.py`** - Tests for Pydantic schema validation
- **`test_models.py`** - Tests for SQLAlchemy database models
- **`pytest.ini`** - Pytest configuration and markers

### Test Categories (Markers)

Tests are organized using pytest markers for easy categorization:

- `@pytest.mark.search` - Search functionality tests
- `@pytest.mark.filter` - Filtering functionality tests
- `@pytest.mark.sort` - Sorting functionality tests
- `@pytest.mark.pagination` - Pagination tests
- `@pytest.mark.validation` - Schema validation tests
- `@pytest.mark.models` - Database model tests
- `@pytest.mark.integration` - Combined operation tests
- `@pytest.mark.edge_case` - Edge cases and error conditions

## 🚀 Quick Start

### Installation

```bash
# From the backend directory
cd backend

# Activate virtual environment
source venv/Scripts/activate  # Windows Git Bash
# or
source venv/bin/activate      # Linux/Mac

# Install test dependencies
pip install -r tests/requirements-test.txt
```

### Running Tests

```bash
# Run all tests (from backend directory)
python -m pytest tests/ -v

# Run tests by category
python -m pytest tests/ -m search -v
python -m pytest tests/ -m filter -v
python -m pytest tests/ -m validation -v

# Run specific test file
python -m pytest tests/test_crud_player.py -v

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

## 📋 Test Coverage

### CRUD Operations (`test_crud_player.py`)

- **Search Tests**: Text search across different fields (name, position, team, etc.)
- **Filter Tests**: Numeric, string, and boolean filters with various operators
- **Sort Tests**: Column sorting with ascending/descending order
- **Pagination Tests**: Page-based result limiting and offsetting
- **Integration Tests**: Combined search + filter + sort operations
- **Edge Cases**: Empty results, invalid inputs, boundary conditions

### Schema Validation (`test_schemas_player.py`)

- **PlayerFilter Validation**: Operator compatibility with field types
- **PlayerSearchParams Validation**: Parameter bounds and defaults
- **Response Models**: API response structure validation
- **Error Handling**: Invalid inputs and validation errors

### Database Models (`test_models.py`)

- **Model Creation**: Player and Team model instantiation
- **Relationships**: One-to-many team-player relationships
- **Constraints**: Foreign key constraints and nullable fields
- **Defaults**: Default value assignment

## 🎯 Test Data

### Fixtures

- **`test_engine`** - In-memory SQLite database for isolation
- **`test_db`** - Database session with automatic cleanup
- **`sample_teams`** - Realistic team data for testing
- **`sample_players`** - Generated player data across teams
- **`specific_test_players`** - Known players for predictable tests

### Data Generation

The `TestDataGenerator` class provides realistic test data:

- **Teams**: Various cities, conferences, divisions
- **Players**: Realistic names, positions, stats, nationalities
- **Relationships**: Proper team assignments and unique jersey numbers

## 📊 VS Code Integration

### Running Tests in VS Code

1. **Install Python Test Explorer Extension**
2. **Configure Test Discovery**:

   - Open Command Palette (Ctrl+Shift+P)
   - Run "Python: Refresh Tests"
   - Tests will appear in the Test Explorer panel

3. **Run by Category**:
   - Use Test Explorer filtering
   - Or run from terminal: `python -m pytest tests/ -m search`

### Test Explorer Features

- ✅ Run individual tests or test classes
- 🔍 Filter by test markers (search, filter, sort, etc.)
- 📊 View test results and failure details
- 🐛 Debug tests with breakpoints

## 🔧 Configuration

### pytest.ini Settings

```ini
[pytest]
testpaths = tests
markers =
    search: Tests for search functionality
    filter: Tests for filtering functionality
    # ... etc

addopts = -v --tb=short --strict-markers --disable-warnings --color=yes
```

### Environment Variables

Tests use in-memory SQLite databases, so no external database configuration is needed.

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

## 🏗️ Adding New Tests

### Test File Structure

```python
"""
Brief description of what this test file covers.
"""

class TestFeatureName:
    """Test specific feature functionality."""

    @pytest.mark.category
    def test_specific_behavior(self, fixtures):
        """
        Test description.
        Input: What inputs are provided
        Expected: What results are expected
        """
        # Test implementation
        assert expected_result
```

### Best Practices

1. **Use descriptive test names** that explain the scenario
2. **Add docstrings** with input/output descriptions
3. **Use appropriate markers** for categorization
4. **Test edge cases** and error conditions
5. **Use fixtures** for reusable test data
6. **Keep tests isolated** and independent

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
source venv/Scripts/activate
# Install test dependencies
pip install -r tests/requirements-test.txt
```

**Database errors:**

```bash
# Tests use in-memory SQLite, no cleanup needed
# If issues persist, check fixture usage
```

### Debug Mode

Run tests with extra debugging:

```bash
python -m pytest tests/ -s -vv --tb=long
```

## 📚 Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [SQLAlchemy Testing Guide](https://docs.sqlalchemy.org/en/14/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites)
- [Pydantic Testing](https://pydantic-docs.helpmanual.io/usage/models/#testing)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
