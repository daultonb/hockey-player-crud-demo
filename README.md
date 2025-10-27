# Hockey Player CRUD Demo

A full-stack web application for managing hockey players and teams, built to showcase modern web development skills with complete CRUD operations, advanced search and filtering, comprehensive statistics tracking, responsive design, and production-ready features including caching, rate limiting, and request logging.

## 🏒 Features

### Player Management
- **Complete CRUD Operations**: Create, Read, Update, and Delete players with full validation
- **Add Players**: Modal form with required fields (name, jersey, position, team, nationality, birthdate, height, weight, handedness, active status)
- **Edit Players**: Update existing player information with pre-populated forms
- **Delete Players**: Confirmation dialog before removal with cascade delete handling
- **Player Details**: Comprehensive modal view showing all player information and statistics

### Statistics Tracking
- **Regular Season Stats**: Games played, goals, assists, and auto-calculated points
- **Playoff Stats**: Separate playoff statistics tracking
- **Combined Stats**: Automatically calculated total statistics
- **Auto-Calculation**: Points fields automatically calculated from goals + assists

### Search & Filtering
- **Advanced Search**: Search across all fields or specific fields (name, position, team, nationality, jersey number)
- **String Matching Modes**:
  - Contains (default) - Case-insensitive substring matching
  - Exact - Precise case-sensitive matching
  - Starts With - Match beginning of field
- **Dynamic Filters**: Multi-filter support with various operators (equals, not equals, contains, greater than, less than, etc.)
- **Real-time Results**: Live search with debounced API calls
- **Filter Persistence**: Maintains filters while navigating

### Sorting & Pagination
- **Multi-Column Sorting**: Sort by any column with ascending/descending order
- **Visual Indicators**: Sort direction arrows on column headers
- **Flexible Pagination**: Configurable items per page (10, 20, 50, 100)
- **Smart Navigation**: Page controls with total page count

### User Experience
- **Toast Notifications**: Success and error messages for all operations
- **Responsive Design**: Professional UI that works on all devices
- **Dark Theme**: Modern dark color scheme with proper contrast
- **Column Management**: Show/hide columns dynamically
- **Loading States**: Clear loading indicators during API calls

### Performance & Caching
- **Redis Caching**: High-performance caching layer for frequently accessed data
- **Configurable TTL**: Cache time-to-live settings (default: 5 minutes)
- **Cache Invalidation**: Automatic cache clearing on data mutations
- **Graceful Degradation**: Application works seamlessly without Redis
- **Connection Pooling**: Efficient Redis connection management

### Security & Rate Limiting
- **API Rate Limiting**: Prevents abuse with configurable request limits
- **Per-IP Tracking**: 100 requests per minute per IP address (configurable)
- **Redis-Backed**: Uses Redis for distributed rate limiting
- **Fallback Protection**: In-memory rate limiting when Redis unavailable
- **Clear Error Messages**: HTTP 429 responses with retry-after headers

### Request Logging & Monitoring
- **Comprehensive Logging**: Detailed request/response logging middleware
- **Performance Metrics**: Request duration tracking
- **Error Tracking**: Exception logging with full details
- **Client Information**: IP address and user agent logging
- **Configurable Levels**: Debug and info log levels

### Data Management
- **Automated Database Restoration**: Weekly automatic restoration to ensure fresh demo data
- **Scheduled Tasks**: APScheduler-based restoration with configurable timing
- **Manual Restoration**: On-demand database reset capability

### Team Organization
- **Team Relationships**: Players properly linked to teams with foreign key constraints
- **Team Details**: Display team name and city with each player
- **Cascade Operations**: Proper handling of team-player relationships

## 🛠️ Tech Stack

### Backend
- **Python 3.12** - Modern Python version
- **FastAPI** - High-performance async web framework for building APIs
- **SQLAlchemy** - SQL toolkit and Object-Relational Mapping (ORM)
- **Pydantic** - Data validation using Python type annotations
- **PostgreSQL** - Production-ready relational database
- **Redis** - In-memory data store for caching and rate limiting
- **python-dotenv** - Environment variable management
- **APScheduler** - Advanced Python Scheduler for automated tasks
- **pytest** - Comprehensive testing framework (115 tests, 100% passing, 95%+ coverage)

### Frontend
- **React 19** - Latest version with modern features
- **TypeScript** - Full type safety across the application
- **Axios** - Promise-based HTTP client for API calls
- **CSS3** - Custom styling with CSS variables and modern features
- **Jest & React Testing Library** - Comprehensive testing (359 tests, 100% passing, 87.84% coverage)

### Infrastructure
- **Redis 7+** - Caching and rate limiting backend
- **Docker** - Containerization support
- **GitHub Actions** - CI/CD pipeline with automated testing

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- npm or yarn
- PostgreSQL 13+ (for production)
- Redis 7+ (optional, for caching and rate limiting)

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # macOS/Linux
   # venv\Scripts\activate   # Windows
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**

   ```bash
   # Copy the example file and modify as needed
   cp .env.example .env
   # Edit .env file with your database URL and settings
   ```

   Example `.env` file:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://user:password@localhost:5432/hockey_db
   # Or for development with SQLite:
   # DATABASE_URL=sqlite:///./hockey_players.db

   # Redis Configuration (optional)
   # Set REDIS_ENABLED=false to disable Redis entirely (no connection attempts)
   # Set REDIS_ENABLED=true to use Redis if available (graceful degradation if unavailable)
   REDIS_ENABLED=true
   REDIS_URL=redis://localhost:6379
   REDIS_CACHE_TTL=300  # Cache TTL in seconds (5 minutes)

   # Rate Limiting Configuration
   RATE_LIMIT_ENABLED=true
   RATE_LIMIT_REQUESTS=100  # Max requests per window
   RATE_LIMIT_WINDOW=60     # Window size in seconds

   # Logging Configuration
   LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL

   # Restoration schedule (optional)
   RESTORE_DAY=0  # 0=Monday, 6=Sunday
   RESTORE_HOUR=2
   RESTORE_MINUTE=0
   ```

5. **Start Redis (optional but recommended):**

   ```bash
   # macOS with Homebrew
   brew services start redis

   # Linux
   sudo systemctl start redis

   # Windows with Memurai
   # Download from https://www.memurai.com/

   # Or with Docker
   docker run -d -p 6379:6379 redis:7-alpine
   ```

6. **Initialize the database:**

   ```bash
   # For PostgreSQL, first create the database
   python init_db.py

   # Populate with sample data
   python populate_db.py
   ```

7. **Start the server:**

   ```bash
   # Development (with auto-reload)
   uvicorn app.main:app --reload

   # Or use the configured server runner
   python run_server.py
   ```

   Backend will be available at `http://127.0.0.1:8000`

8. **(Optional) Enable automated restoration:**

   ```bash
   # Run the scheduled restoration service
   python scheduled_restore.py
   ```

   See [RESTORATION_GUIDE.md](backend/RESTORATION_GUIDE.md) for deployment options.

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   # Create .env file with your API endpoint
   echo "REACT_APP_API_BASE_URL=http://127.0.0.1:8000" > .env
   ```

4. **Start the development server:**

   ```bash
   npm start
   ```

   Frontend will be available at `http://localhost:3000`

## 🧪 Testing

### Backend Tests

Run the comprehensive test suite with 115 tests achieving 95%+ coverage:

```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v

# Run with coverage report
python -m pytest tests/ --cov=app --cov-report=html --cov-report=term-missing -v
```

**Coverage Target**: 85%+ (enforced by CI/CD pipeline)

Test coverage includes:
- API endpoint integration tests (25+ tests)
- CRUD operations (create, read, update, delete)
- Search functionality with string matching modes
- Advanced filtering with multiple operators
- Sorting and pagination
- Schema validation with Pydantic
- Database models and relationships
- Redis caching and rate limiting
- Request logging middleware
- Error handling and edge cases

See [backend/tests/TEST_README.md](backend/tests/TEST_README.md) for detailed testing documentation.

### Frontend Tests

Run the comprehensive test suite with 359 tests achieving 87.84% coverage:

```bash
cd frontend
npm test

# Run with coverage report
npm run test:coverage
```

**Coverage Target**: 85%+ (enforced by CI/CD pipeline)

Test coverage includes:
- Component rendering and behavior (14 test suites)
- User interactions and events
- Search and filter functionality
- Modal dialogs (Add, Edit, Delete, Details)
- API integration with mocked responses
- Toast notifications and error handling
- Column management
- Performance monitoring hooks
- Edge cases and error conditions

See [frontend/src/__tests__/TEST_README.md](frontend/src/__tests__/TEST_README.md) for detailed testing documentation.

### CI/CD Pipeline

GitHub Actions automatically runs tests on every push and pull request:
- ✅ Backend tests with PostgreSQL and Redis services
- ✅ Frontend tests with Node.js 20
- ✅ Code coverage validation (85% threshold)
- ✅ Security scanning (npm audit, pip-audit, safety, bandit)
- ✅ Dependency vulnerability checks

## 📊 Database Schema

### Teams Table

- `id` (Primary Key) - Unique team identifier
- `name` - Team name
- `city` - Team city
- `conference` - Eastern/Western
- `division` - Team division
- `founded_year` - Year team was founded
- `arena` - Home arena name

### Players Table

- `id` (Primary Key) - Unique player identifier
- `name` - Player full name
- `position` - Playing position (C, LW, RW, D, G)
- `nationality` - Player nationality
- `team_id` (Foreign Key) - Reference to teams table
- `jersey_number` - Player's jersey number (0-99)
- `birth_date` - Date of birth
- `height` - Player height (e.g., 6'2")
- `weight` - Player weight in lbs
- `handedness` - Left (L) or Right (R)
- `active_status` - Whether player is currently active

#### Regular Season Statistics
- `regular_season_games_played` - Regular season games played
- `regular_season_goals` - Regular season goals scored
- `regular_season_assists` - Regular season assists
- `regular_season_points` - Auto-calculated regular season points

#### Playoff Statistics
- `playoff_games_played` - Playoff games played
- `playoff_goals` - Playoff goals scored
- `playoff_assists` - Playoff assists
- `playoff_points` - Auto-calculated playoff points

#### Combined Statistics
- `games_played` - Total games played (regular + playoff)
- `goals` - Total goals (regular + playoff)
- `assists` - Total assists (regular + playoff)
- `points` - Total points (regular + playoff)

## 🔗 API Endpoints

### Core Endpoints

- `GET /` - Welcome message and API status
- `GET /health` - Health check endpoint
- `GET /config` - View current configuration (development only)

### Player Endpoints

- `GET /players` - Get players with advanced search, filtering, sorting, and pagination
  - Query Parameters:
    - `search` - Search query string
    - `field` - Field to search in (all, name, position, team, nationality, jersey_number)
    - `match_mode` - String matching mode (contains, exact, starts_with)
    - `page` - Page number (default: 1)
    - `limit` - Results per page (default: 20, max: 100)
    - `sort_by` - Field to sort by
    - `sort_order` - Sort direction (asc/desc)
    - `filters` - JSON array of filter objects
- `GET /players/{id}` - Get a single player by ID with full details
- `POST /players` - Create a new player (auto-invalidates cache)
- `PUT /players/{id}` - Update an existing player (auto-invalidates cache)
- `DELETE /players/{id}` - Delete a player (auto-invalidates cache)

### Team Endpoints

- `GET /teams` - Get all teams (cached for 5 minutes)

### Performance Features

- **Caching**: GET requests cached with Redis (5-minute TTL)
- **Cache Invalidation**: Automatic clearing on POST/PUT/DELETE
- **Rate Limiting**: 100 requests per minute per IP
- **Request Logging**: Full request/response logging with performance metrics

### Interactive Documentation

Visit `http://127.0.0.1:8000/docs` when the backend is running to see the automatically generated API documentation with interactive testing capabilities.

## 🎨 UI Components

### Modals
- **Player Details Modal**: View complete player information with Edit/Delete actions
- **Player Form Modal**: Reusable form for adding and editing players with validation
- **Delete Confirmation Modal**: Safety confirmation before player deletion
- **Filter Modal**: Advanced filtering interface with multiple filter support
- **Column Toggle Modal**: Show/hide columns dynamically

### Components
- **PlayersTable**: Main data grid with sorting, pagination, and column management
- **PlayerSearch**: Search bar with field selection, match mode, and filter access
- **Toast Notifications**: Non-intrusive success/error messages
- **Pagination Controls**: Navigate through pages with configurable page size
- **Column Visibility**: Toggle which columns to display

## 🚀 Deployment

### Backend Deployment

The backend is designed for easy deployment to:

- **Heroku**: With PostgreSQL and Redis add-ons
- **AWS**: Elastic Beanstalk or Lambda with RDS PostgreSQL and ElastiCache Redis
- **DigitalOcean**: App Platform with managed PostgreSQL and Redis
- **Railway**: With built-in PostgreSQL and Redis

**Required Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (optional)
- `REDIS_ENABLED` - Enable/disable Redis (true/false)
- `RATE_LIMIT_ENABLED` - Enable/disable rate limiting (true/false)

See [RESTORATION_GUIDE.md](backend/RESTORATION_GUIDE.md) for detailed deployment instructions including:
- systemd service configuration
- Docker deployment
- Heroku scheduler setup
- AWS EventBridge configuration

### Frontend Deployment

The frontend can be deployed to:

- **Vercel**: Zero-config deployment with GitHub integration
- **Netlify**: Continuous deployment with environment variables
- **AWS S3 + CloudFront**: Static hosting with CDN
- **GitHub Pages**: Free static hosting

Update the `REACT_APP_API_BASE_URL` environment variable to point to your production backend.

### Database

For production, use PostgreSQL:

Implementation TBD.

### Caching

For production Redis:

Implemenation TBD.

## 📝 Project Structure

```
hockey-player-crud-demo/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml           # Backend CI/CD pipeline
│       ├── frontend-ci.yml          # Frontend CI/CD pipeline
│       └── scripts/
│           ├── check_coverage.py    # Backend coverage validation (85%)
│           ├── check_frontend_coverage.py  # Frontend coverage (85%)
│           ├── check_security.py    # Security scan results validator
│           ├── check_dependencies.py # Dependency vulnerability checker
│           └── check_npm_security.py # NPM security validator
├── backend/
│   ├── app/
│   │   ├── config.py           # Application configuration
│   │   ├── database.py         # Database connection
│   │   ├── main.py             # FastAPI application and routes
│   │   ├── redis_client.py     # Redis connection pool manager
│   │   ├── cache.py            # Caching layer with Redis
│   │   ├── rate_limiter.py     # Rate limiting middleware
│   │   ├── logging_middleware.py # Request/response logging
│   │   ├── models/             # SQLAlchemy models
│   │   │   ├── player.py
│   │   │   └── team.py
│   │   ├── schemas/            # Pydantic schemas
│   │   │   └── player.py
│   │   └── crud/               # CRUD operations
│   │       └── player.py
│   ├── tests/                  # Comprehensive test suite (115 tests)
│   │   ├── conftest.py
│   │   ├── test_main.py
│   │   ├── test_crud_player.py
│   │   ├── test_schemas_player.py
│   │   ├── test_models.py
│   │   ├── pytest.ini
│   │   └── TEST_README.md      # Testing documentation
│   ├── restore_database.py     # Manual restoration script
│   ├── scheduled_restore.py    # Automated restoration service
│   ├── RESTORATION_GUIDE.md    # Deployment guide
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── modals/
    │   │   │   ├── Modal.tsx
    │   │   │   ├── PlayerFormModal.tsx
    │   │   │   ├── DeleteConfirmationModal.tsx
    │   │   │   ├── PlayerDetailsModal.tsx
    │   │   │   ├── FilterModal.tsx
    │   │   │   └── ColumnToggleModal.tsx
    │   │   ├── players/
    │   │   │   ├── PlayersTable.tsx
    │   │   │   ├── PlayerSearch.tsx
    │   │   │   └── PaginationControls.tsx
    │   │   ├── Toast.tsx
    │   │   └── ToastContainer.tsx
    │   ├── hooks/
    │   │   └── usePerformance.ts   # Performance monitoring hooks
    │   ├── utils/
    │   │   └── performance.ts      # Performance monitoring utilities
    │   ├── types/
    │   │   └── Player.ts
    │   ├── __tests__/          # Comprehensive test suite (359 tests)
    │   │   └── TEST_README.md  # Frontend testing documentation
    │   └── App.tsx
    └── package.json
```

## 🔒 Data Validation

### Backend Validation (Pydantic)
- Position must be one of: C, LW, RW, D, G
- Handedness must be L or R
- Jersey number must be 0-99
- Required fields enforced
- Date format validation
- Integer range validation

### Frontend Validation
- All required fields must be filled
- Jersey number range check (0-99)
- Weight must be positive
- Date format validation
- Real-time error messages
- Form submission prevention on errors

## 🔐 Security Features

- **Rate Limiting**: Prevents API abuse with configurable limits
- **Input Validation**: Comprehensive validation on both frontend and backend
- **SQL Injection Protection**: SQLAlchemy parameterized queries
- **CORS Configuration**: Configurable allowed origins
- **Security Scanning**: Automated vulnerability checks in CI/CD
- **Dependency Audits**: Regular scans for known vulnerabilities

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!
Send me a message on LinkedIn or via email!

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Daulton B**

- Portfolio: [Coming Soon]
- LinkedIn: [https://www.linkedin.com/in/daultonbaird/]
- GitHub: [@daultonb]

---

**Built using React, FastAPI, PostgreSQL, and Redis**
