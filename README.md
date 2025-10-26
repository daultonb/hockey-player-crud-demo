# Hockey Player CRUD Demo

A full-stack web application for managing hockey players and teams, built to showcase modern web development skills with complete CRUD operations, advanced search and filtering, comprehensive statistics tracking, and responsive design.

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
- **python-dotenv** - Environment variable management
- **APScheduler** - Advanced Python Scheduler for automated tasks
- **pytest** - Comprehensive testing framework (115 tests, 100% passing)

### Frontend
- **React 19** - Latest version with modern features
- **TypeScript** - Full type safety across the application
- **Axios** - Promise-based HTTP client for API calls
- **CSS3** - Custom styling with CSS variables and modern features
- **Jest & React Testing Library** - Comprehensive testing (240 tests, 100% passing)

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 16+
- npm or yarn
- PostgreSQL 13+ (for production) or SQLite (for development)

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
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/hockey_db
   # Or for development with SQLite:
   # DATABASE_URL=sqlite:///./hockey_players.db

   # Restoration schedule (optional)
   RESTORE_DAY=0  # 0=Monday, 6=Sunday
   RESTORE_HOUR=2
   RESTORE_MINUTE=0
   ```

5. **Initialize the database:**

   ```bash
   # For PostgreSQL, first create the database
   python init_db.py

   # Populate with sample data
   python populate_db.py
   ```

6. **Start the server:**

   ```bash
   # Development (with auto-reload)
   uvicorn app.main:app --reload

   # Or use the configured server runner
   python run_server.py
   ```

   Backend will be available at `http://127.0.0.1:8000`

7. **(Optional) Enable automated restoration:**

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

Run the comprehensive test suite with 115 tests:

```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

Test coverage includes:
- CRUD operations (create, read, update, delete)
- Search functionality across all fields
- Advanced filtering with multiple operators
- Sorting and pagination
- Schema validation
- Database models and relationships
- API endpoint integration tests

### Frontend Tests

Run the comprehensive test suite with 240 tests:

```bash
cd frontend
npm test
```

Test coverage includes:
- Component rendering and behavior
- User interactions and events
- Search and filter functionality
- Modal dialogs (Add, Edit, Delete)
- API integration
- Toast notifications
- Column management
- Edge cases and error handling

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
    - `page` - Page number (default: 1)
    - `limit` - Results per page (default: 20, max: 100)
    - `sort_by` - Field to sort by
    - `sort_order` - Sort direction (asc/desc)
    - `filters` - JSON array of filter objects
- `GET /players/{id}` - Get a single player by ID with full details
- `POST /players` - Create a new player
- `PUT /players/{id}` - Update an existing player
- `DELETE /players/{id}` - Delete a player

### Team Endpoints

- `GET /teams` - Get all teams (for dropdown selection)

### Interactive Documentation

Visit `http://127.0.0.1:8000/docs` when the backend is running to see the automatically generated API documentation with interactive testing capabilities.

## 🎨 UI Components

### Modals
- **Player Details Modal**: View complete player information with Edit/Delete actions
- **Player Form Modal**: Reusable form for adding and editing players with validation
- **Delete Confirmation Modal**: Safety confirmation before player deletion
- **Filter Modal**: Advanced filtering interface with multiple filter support

### Components
- **PlayersTable**: Main data grid with sorting, pagination, and column management
- **PlayerSearch**: Search bar with field selection and filter access
- **Toast Notifications**: Non-intrusive success/error messages
- **Pagination Controls**: Navigate through pages with configurable page size
- **Column Visibility**: Toggle which columns to display

## 🚀 Deployment

### Backend Deployment

The backend is designed for easy deployment to:

- **Heroku**: With PostgreSQL add-on
- **AWS**: Elastic Beanstalk or Lambda with RDS PostgreSQL
- **DigitalOcean**: App Platform with managed PostgreSQL
- **Railway**: With built-in PostgreSQL

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

- **AWS RDS**: Managed PostgreSQL with automated backups
- **Heroku Postgres**: Easy integration with Heroku deployments
- **DigitalOcean Managed Databases**: Simple setup and scaling
- **Supabase**: Open-source Firebase alternative with PostgreSQL

## 📝 Project Structure

```
hockey-player-crud-demo/
├── backend/
│   ├── app/
│   │   ├── config.py           # Application configuration
│   │   ├── database.py         # Database connection
│   │   ├── main.py             # FastAPI application and routes
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
│   │   └── test_models.py
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
    │   │   │   └── FilterModal.tsx
    │   │   ├── players/
    │   │   │   ├── PlayersTable.tsx
    │   │   │   └── PlayerSearch.tsx
    │   │   ├── Toast.tsx
    │   │   └── ToastContainer.tsx
    │   ├── types/
    │   │   └── Player.ts
    │   ├── __tests__/          # Comprehensive test suite (240 tests)
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
- Jersey number range check
- Date format validation
- Real-time error messages
- Form submission prevention on errors

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass (`pytest` for backend, `npm test` for frontend)
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Daulton B**

- Portfolio: [Coming Soon]
- LinkedIn: [https://www.linkedin.com/in/daultonbaird/]
- GitHub: [@daultonb]

---

**Built with ❤️ using React, FastAPI, and PostgreSQL**
