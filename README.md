# Hockey Player CRUD Demo

A full-stack web application for managing hockey players and teams, built to showcase modern web development skills with CRUD operations, database management, and responsive design.

## 🏒 Features

- **Player Management**: View detailed information for hockey players in a clean table format
- **Team Organization**: Players organized by teams with proper database relationships
- **Responsive Design**: Professional UI that works on all devices
- **RESTful API**: Well-structured backend API with automatic documentation
- **Type Safety**: Full TypeScript implementation on frontend
- **Environment Configuration**: Flexible configuration using environment variables

## 🛠️ Tech Stack

### Backend

- **Python 3.13** - Latest Python version
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and Object-Relational Mapping (ORM)
- **Pydantic** - Data validation using Python type annotations
- **SQLite** - Lightweight database for development
- **python-dotenv** - Environment variable management

### Frontend

- **React 18** - Modern JavaScript library for building user interfaces
- **TypeScript** - Typed superset of JavaScript
- **Axios** - Promise-based HTTP client
- **CSS3** - Custom styling with modern CSS features

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # macOS/Linux
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**

   ```bash
   # Copy the example file and modify as needed
   cp .env.example .env
   # Edit .env file with your preferred settings
   ```

5. **Populate database with sample data:**

   ```bash
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

## 📊 Database Schema

### Teams Table

- `id` (Primary Key)
- `name` - Team name
- `city` - Team city
- `conference` - Eastern/Western
- `division` - Team division
- `founded_year` - Year team was founded
- `arena` - Home arena name

### Players Table

- `id` (Primary Key)
- `name` - Player full name
- `position` - Playing position
- `nationality` - Player nationality
- `team_id` (Foreign Key) - Reference to teams table
- `jersey_number` - Player's jersey number
- `birth_date` - Date of birth
- `height` - Player height
- `weight` - Player weight (lbs)
- `handedness` - Left/Right handed
- `goals` - Career goals scored
- `assists` - Career assists
- `points` - Total career points (goals + assists)
- `active_status` - Whether player is currently active

## 🔗 API Endpoints

### Current Endpoints

- `GET /` - Welcome message and API status
- `GET /health` - Health check endpoint
- `GET /players` - Get all players with team information
- `GET /config` - View current configuration (development only)

### Interactive Documentation

Visit `http://127.0.0.1:8000/docs` when the backend is running to see the automatically generated API documentation.

## 🚀 Deployment

This application is designed to be easily deployable to modern platforms:

- **Backend**: Vercel, Heroku, AWS Lambda
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: PostgreSQL (AWS RDS, Heroku Postgres)

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Daulton B**

- Portfolio: [Coming Soon]
- LinkedIn: [https://www.linkedin.com/in/daultonbaird/]
- GitHub: [@daultonb]

---
