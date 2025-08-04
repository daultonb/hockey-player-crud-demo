#!/bin/bash
# Test runner script for hockey CRUD application
# Usage: ./tests/run_tests.sh [test_type]
# Run from the backend directory

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏒 Hockey CRUD Application Test Runner${NC}"
echo "============================================"

# Ensure we're in the backend directory
if [ ! -f "requirements.txt" ] || [ ! -d "tests" ]; then
    echo -e "${RED}❌ Error: Please run this script from the backend directory${NC}"
    echo -e "${YELLOW}Expected structure: backend/tests/run_tests.sh${NC}"
    exit 1
fi

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo -e "${YELLOW}⚠️  Warning: Virtual environment not detected. Activating...${NC}"
    source venv/Scripts/activate || source venv/bin/activate
fi

# Install test dependencies if needed
if [ ! -f "tests/requirements-test.txt" ]; then
    echo -e "${YELLOW}⚠️  tests/requirements-test.txt not found. Using main requirements only.${NC}"
else
    echo -e "${BLUE}📦 Installing test dependencies...${NC}"
    pip install -r tests/requirements-test.txt
fi

# Test command options
case "${1:-all}" in
    "all")
        echo -e "${GREEN}🧪 Running all tests...${NC}"
        pytest tests/ -v
        ;;
    "search")
        echo -e "${GREEN}🔍 Running search tests...${NC}"
        pytest tests/ -m search -v
        ;;
    "filter")
        echo -e "${GREEN}🔄 Running filter tests...${NC}"
        pytest tests/ -m filter -v
        ;;
    "sort")
        echo -e "${GREEN}📊 Running sort tests...${NC}"
        pytest tests/ -m sort -v
        ;;
    "pagination")
        echo -e "${GREEN}📄 Running pagination tests...${NC}"
        pytest tests/ -m pagination -v
        ;;
    "validation")
        echo -e "${GREEN}✅ Running validation tests...${NC}"
        pytest tests/ -m validation -v
        ;;
    "models")
        echo -e "${GREEN}🗄️  Running model tests...${NC}"
        pytest tests/ -m models -v
        ;;
    "integration")
        echo -e "${GREEN}🔗 Running integration tests...${NC}"
        pytest tests/ -m integration -v
        ;;
    "edge")
        echo -e "${GREEN}⚡ Running edge case tests...${NC}"
        pytest tests/ -m edge_case -v
        ;;
    "crud")
        echo -e "${GREEN}📝 Running CRUD operation tests...${NC}"
        pytest tests/test_crud_player.py -v
        ;;
    "schemas")
        echo -e "${GREEN}🔍 Running schema validation tests...${NC}"
        pytest tests/test_schemas_player.py -v
        ;;
    "coverage")
        echo -e "${GREEN}📊 Running tests with coverage report...${NC}"
        pytest tests/ --cov=app --cov-report=html --cov-report=term-missing -v
        echo -e "${BLUE}📋 Coverage report generated in htmlcov/index.html${NC}"
        ;;
    "parallel")
        echo -e "${GREEN}⚡ Running tests in parallel...${NC}"
        pytest tests/ -n auto -v
        ;;
    "quick")
        echo -e "${GREEN}🚀 Running quick test subset...${NC}"
        pytest tests/ -m "not integration" --maxfail=3 -v
        ;;
    "debug")
        echo -e "${GREEN}🐛 Running tests in debug mode...${NC}"
        pytest tests/ -s -vv --tb=long
        ;;
    "help")
        echo -e "${BLUE}Available test categories:${NC}"
        echo "  all         - Run all tests (default)"
        echo "  search      - Search functionality tests"
        echo "  filter      - Filter functionality tests"
        echo "  sort        - Sorting functionality tests"
        echo "  pagination  - Pagination tests"
        echo "  validation  - Schema validation tests"
        echo "  models      - Database model tests"
        echo "  integration - Combined operation tests"
        echo "  edge        - Edge case tests"
        echo "  crud        - All CRUD operation tests"
        echo "  schemas     - All schema tests"
        echo "  coverage    - Run with coverage report"
        echo "  parallel    - Run tests in parallel"
        echo "  quick       - Run quick subset (no integration)"
        echo "  debug       - Run with verbose debugging"
        echo "  help        - Show this help message"
        ;;
    *)
        echo -e "${RED}❌ Unknown test type: $1${NC}"
        echo -e "${YELLOW}Use './run_tests.sh help' to see available options${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Test run completed!${NC}"