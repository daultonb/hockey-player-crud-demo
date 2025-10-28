# Frontend Test Suite Documentation

This directory contains comprehensive unit and integration tests for the Hockey Player CRUD application frontend. **All 359 tests passing ✅**

## 🧪 Test Structure

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── App.test.tsx                          # Main App component tests
│   │   ├── PlayerFormModal.component.test.tsx    # Player form modal tests (22 tests)
│   │   ├── PlayersTable.component.test.tsx       # Main table component tests (299 tests)
│   │   ├── usePerformance.test.ts                # Performance hooks tests (20 tests)
│   │   ├── performance.test.ts                   # Performance utilities tests (18 tests)
│   │   └── TEST_README.md                        # This documentation
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── package.json
```

### Test Files Overview

- **`App.test.tsx`** - Tests for main application component
- **`PlayerFormModal.component.test.tsx`** - Comprehensive modal form testing (add/edit players)
- **`PlayersTable.component.test.tsx`** - Main data table with search, filter, sort, pagination
- **`usePerformance.test.ts`** - React hooks for performance monitoring
- **`performance.test.ts`** - Performance monitoring utility functions

## 🚀 Quick Start

### Installation

```bash
# From the frontend directory
cd frontend

# Install dependencies
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (interactive)
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- PlayerFormModal.component.test.tsx
npm test -- PlayersTable.component.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="should render"
```

### Expected Results

```
Test Suites: 14 passed, 14 total
Tests:       359 passed, 359 total
Snapshots:   0 total
Time:        ~15-20s
```

## 📊 Test Coverage

**Current Coverage**: 87.84% (Target: 85%+)

### Coverage by File

| File                | Statements | Branches | Functions | Lines  |
| ------------------- | ---------- | -------- | --------- | ------ |
| PlayerFormModal.tsx | 94.44%     | 82.2%    | 100%      | 94.28% |
| usePerformance.ts   | 100%       | 100%     | 100%      | 100%   |
| performance.ts      | 62.96%     | 37.5%    | 100%      | 60%    |
| PlayersTable.tsx    | 95%+       | 90%+     | 95%+      | 95%+   |
| ToastContainer.tsx  | 77.27%     | 50%      | 60%       | 83.33% |
| Overall             | 87.6%      | 80.53%   | 86.7%     | 87.84% |

### Generate Coverage Report

```bash
# Generate HTML coverage report
npm run test:coverage

# Open coverage report in browser
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

## 📋 Test Categories

### PlayerFormModal Tests (22 tests)

**Modal Rendering (4 tests)**

- Renders in add mode with correct title
- Renders in edit mode with pre-populated data
- Does not render when `isOpen` is false
- Fetches teams on modal open

**Form Fields (5 tests)**

- Renders all required form fields (name, jersey, position, team, etc.)
- Populates form fields correctly in edit mode
- Handles user input changes
- Manages active status radio buttons (Active/Retired)
- Validates field types and requirements

**Playoff Fields Toggle (3 tests)**

- Shows playoff statistics fields when toggle clicked
- Auto-shows playoff fields in edit mode if player has playoff stats
- Hides playoff fields when toggle clicked again

**Form Validation (5 tests)**

- Shows validation errors for required fields
- Validates jersey number range (0-99)
- Validates weight is positive
- Clears validation errors when fields corrected
- Prevents submission with validation errors

**Form Submission (5 tests)**

- Successfully submits new player in add mode
- Successfully updates existing player in edit mode
- Handles API errors with user-friendly messages
- Disables submit button while submitting
- Calls onSuccess callback after successful submission

### PlayersTable Tests (299 tests)

**Component Rendering**

- Initial table rendering with loading state
- Data table with player rows
- Column headers with sort indicators
- Pagination controls
- Search and filter UI

**Data Fetching & Display**

- Fetches players on mount
- Fetches column metadata for dynamic columns
- Displays player data in table rows
- Shows loading indicators during fetch
- Handles empty results gracefully

**Search Functionality**

- Text search across all fields
- Field-specific search (name, position, team, etc.)
- Search with debouncing
- Clear search functionality
- Search persistence across page changes

**Filter Functionality**

- Add/remove filters dynamically
- Multiple filter combinations
- Filter by different field types (string, number, boolean)
- Filter operators (equals, contains, greater than, etc.)
- Clear all filters

**Sorting**

- Sort by any column
- Ascending/descending order toggle
- Visual sort indicators
- Sort persistence
- Multi-column sort support

**Pagination**

- Navigate between pages
- Change items per page (10, 20, 50, 100)
- Correct page calculation
- Disable navigation at boundaries
- Total results display

**CRUD Operations**

- View player details modal
- Edit player (opens form modal)
- Delete player with confirmation
- Create new player
- Success/error toast notifications

**Column Management**

- Show/hide columns dynamically
- Column visibility persistence
- Toggle individual columns
- Reset to default columns

**Error Handling**

- API error display
- Network error recovery
- Invalid data handling
- 404 responses
- Malformed API responses

### Performance Monitoring Tests (38 tests)

**usePerformance Hooks (20 tests)**

`useComponentPerformance`:

- Logs component mount events
- Logs component unmount with lifetime
- Tracks render count and re-renders
- Does not log on first render

`useAsyncPerformance`:

- Tracks successful async operations
- Tracks failed async operations with proper cleanup
- Returns correct result from async function

`useFetchPerformance`:

- Starts fetch tracking with timer
- Marks response received checkpoint
- Marks data processed checkpoint
- Ends fetch tracking
- Handles fetch errors gracefully
- Tracks complete fetch lifecycle

`useInteractionTracking`:

- Tracks button clicks
- Tracks page changes
- Tracks search queries
- Handles multiple interactions in sequence

**Performance Utilities (18 tests)**

`PerformanceMonitor`:

- Logs messages with/without duration
- Starts named timers
- Ends timers and calculates duration
- Adds checkpoints to running timers
- Handles missing timers gracefully

`@timed Decorator`:

- Tracks async method execution time
- Tracks methods even if they throw errors
- Preserves method return values

`trackApiCall Function`:

- Wraps and tracks API calls
- Handles successful/failed API calls
- Passes arguments through correctly
- Preserves function return types

`RenderTracker`:

- Logs render start on construction
- Logs render complete with duration
- Tracks render duration accurately
- Supports multiple component instances

## 🎯 Testing Best Practices

### Test Structure (AAA Pattern)

```typescript
it("should perform expected behavior", async () => {
  // Arrange - Set up test data and mocks
  const mockData = { id: 1, name: "Test" };
  mockedAxios.get.mockResolvedValue({ data: mockData });

  // Act - Execute the code being tested
  render(<Component />);
  await userEvent.click(screen.getByRole("button"));

  // Assert - Verify expected outcomes
  expect(screen.getByText("Expected Result")).toBeInTheDocument();
  expect(mockedAxios.get).toHaveBeenCalledTimes(1);
});
```

### Mocking External Dependencies

```typescript
// Mock axios
jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Setup mock before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockedAxios.get.mockResolvedValue({ data: mockPlayers });
});
```

### Testing User Interactions

```typescript
import userEvent from "@testing-library/user-event";

// Click button
await userEvent.click(screen.getByRole("button", { name: "Submit" }));

// Type in input
await userEvent.type(screen.getByLabelText("Name"), "John Doe");

// Select option
await userEvent.selectOptions(screen.getByLabelText("Position"), "C");

// Click radio button
await userEvent.click(screen.getByLabelText("Active"));
```

### Async Testing

```typescript
import { waitFor } from "@testing-library/react";

// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText("Loaded Data")).toBeInTheDocument();
});

// Wait for API call
await waitFor(() => {
  expect(mockedAxios.get).toHaveBeenCalled();
});
```

## 🔧 Test Configuration

### jest.config.js (via react-scripts)

Tests are configured through `react-scripts` with the following setup:

- **Test Environment**: jsdom (browser-like environment)
- **Transform**: TypeScript and JSX via babel-jest
- **Coverage**: Istanbul for code coverage
- **Setup Files**: setupTests.ts for global test configuration

### setupTests.ts

```typescript
import "@testing-library/jest-dom";
```

Imports jest-dom matchers for convenient assertions like:

- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toBeVisible()`
- `toBeDisabled()`

## 📈 CI/CD Integration

### GitHub Actions Workflow

The frontend tests run automatically on every push and pull request:

```yaml
name: Frontend CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
      - run: cd frontend && npm ci
      - run: cd frontend && npm test -- --coverage --watchAll=false
      - run: python .github/workflows/scripts/check_frontend_coverage.py
```

**Coverage Threshold**: 85% (enforced by CI)

### Coverage Requirements

- Line Coverage: 85%+
- Branch Coverage: 80%+
- Function Coverage: 85%+

Failing to meet these thresholds will cause the CI pipeline to fail.

## 🐛 Troubleshooting

### Common Issues

**1. Tests Not Found**

```bash
# Clear Jest cache
npm test -- --clearCache

# Verify test files are in correct location
ls src/__tests__/*.test.tsx
```

**2. Module Not Found Errors**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**3. Timeout Errors**

```typescript
// Increase timeout for slow tests
it("slow test", async () => {
  // Test code
}, 10000); // 10 second timeout
```

**4. Mock Not Working**

```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Reset mock implementation
mockedAxios.get.mockReset();
mockedAxios.get.mockResolvedValue({ data: newMockData });
```

**5. State Updates After Test**

```typescript
// Wrap async operations in act()
import { act } from "@testing-library/react";

act(() => {
  // Code that updates state
});
```

### Debug Mode

```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test file for debugging
npm test -- PlayerFormModal.component.test.tsx --watch

# Show console logs
npm test -- --silent=false
```

## 📚 Additional Resources

### React Testing Library

- [Official Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Cheat Sheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Jest

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Mock Functions](https://jestjs.io/docs/mock-functions)

### User Event

- [User Event API](https://testing-library.com/docs/user-event/intro)
- [Pointer Interactions](https://testing-library.com/docs/user-event/pointer)
- [Keyboard Interactions](https://testing-library.com/docs/user-event/keyboard)

## 🎓 Writing New Tests

### Test Template

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MyComponent from "../components/MyComponent";

// Mock external dependencies
jest.mock("axios", () => ({
  get: jest.fn(),
}));
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("MyComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Feature Category", () => {
    it("should do something specific", async () => {
      // Arrange
      const mockData = { id: 1, value: "test" };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      // Act
      render(<MyComponent />);
      await userEvent.click(screen.getByRole("button"));

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Expected Text")).toBeInTheDocument();
      });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Testing Checklist

- [ ] Test renders without crashing
- [ ] Test with different prop combinations
- [ ] Test user interactions (clicks, typing, etc.)
- [ ] Test async operations (API calls, timers)
- [ ] Test error states and edge cases
- [ ] Test loading states
- [ ] Test empty states (no data)
- [ ] Test accessibility (ARIA labels, roles)
- [ ] Mock external dependencies
- [ ] Clean up after tests (clear mocks, reset state)

## 📊 Test Statistics

- **Total Tests**: 359
- **Pass Rate**: 100% ✅
- **Test Suites**: 14
- **Coverage**: 87.84%
- **Average Runtime**: ~15-20 seconds
- **Coverage Target**: 85% (CI/CD enforced)

### Test Distribution

- PlayerFormModal: 22 tests (6%)
- PlayersTable: 299 tests (83%)
- Performance Hooks: 20 tests (6%)
- Performance Utils: 18 tests (5%)

### Coverage Goals

- **High Priority** (90%+ coverage):

  - Core components (PlayersTable, PlayerFormModal)
  - CRUD operations and API interactions
  - Search and filter functionality

- **Medium Priority** (80%+ coverage):

  - UI components (Toast, Modal)
  - Helper utilities
  - Type definitions

- **Lower Priority** (70%+ coverage):
  - Performance monitoring (optional feature)
  - Development-only utilities

---

**Last Updated**: After achieving 87.84% coverage with 359 passing tests
