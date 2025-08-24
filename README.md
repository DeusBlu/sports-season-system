# Sports Season System

A React TypeScript application for tracking private user sports seasons, specifically designed for digital video game hockey matches. Built with Vite and deployable to Cloudflare Pages with D1 database integration.

## Features

- **Digital Hockey Season Management**: Track your video game hockey seasons across multiple games (NHL 25, Wayne Gretzky Hockey, etc.)
- **Calendar View**: Outlook-style calendar for viewing scheduled games with home/away indicators
- **Cloudflare D1 Database**: Serverless SQLite database for reliable data persistence
- **Serverless Functions**: API endpoints powered by Cloudflare Functions
- **Modern Development**: React 18 + TypeScript + Vite for optimal developer experience

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v7
- **Calendar**: React Big Calendar with Moment.js
- **Database**: Cloudflare D1 (SQLite)
- **API**: Cloudflare Functions
- **Deployment**: Cloudflare Pages
- **Styling**: CSS with ice hockey theme (blue/white gradient, orange/black accents)

## Development Setup

### Prerequisites

- Node.js 20.19+ (tested with 22.18.0)
- npm or yarn
- Wrangler CLI (for Cloudflare development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

### Database Setup

Initialize the D1 database with migrations:

```bash
# Apply all migrations to local D1 database
npm run migrate:local

# Or run individual migrations
npx wrangler d1 execute sports_seasons --local --file=migrations/0001_create_seasons.sql
npx wrangler d1 execute sports_seasons --local --file=migrations/0002_create_games.sql
npx wrangler d1 execute sports_seasons --local --file=migrations/0003-add-user-seasons.sql
npx wrangler d1 execute sports_seasons --local --file=migrations/0004-add-season-members.sql

# For production deployment
npm run migrate:remote

# Alternative: Use migration scripts
# Windows: scripts/migrate.bat
# Unix/Mac: scripts/migrate.sh
```

**Database Schema:**
- `seasons` - Hockey seasons and basic configuration
- `games` - Individual game records and scheduling
- `User_Seasons` - Season ownership/management (who controls each season)
- `Season_Members` - Season participation (who plays in each season)
```

### Development

Start the development server with D1 database:
```bash
npm run dev:d1:start
```

The application will be available at `http://localhost:5173`
API endpoints will be available at `http://localhost:8788/api`

For frontend-only development:
```bash
npm run dev:frontend
```

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
  ├── components/
  │   ├── HockeyCalendar.tsx    # Calendar component for game scheduling
  │   └── Layout.tsx            # Main layout wrapper
  ├── pages/
  │   ├── Hockey.tsx            # Hockey-specific season management
  │   ├── ManageSeasons.tsx     # Season CRUD operations
  │   └── Schedule.tsx          # Game scheduling interface
  ├── services/
  │   └── dataService.ts        # API service for D1 database communication
  ├── test/
  │   └── utils.tsx             # Test utilities and helpers
  ├── App.tsx                   # Main application component
  ├── App.css                   # Main styles
  └── main.tsx                  # Entry point

functions/
  └── api/
      ├── health.ts             # Health check endpoint
      └── seasons/
          ├── index.ts          # Seasons CRUD endpoints
          └── [id].ts           # Individual season operations

migrations/
  ├── 0001_create_seasons.sql   # Initial seasons table
  └── 0002_create_games.sql     # Games table with foreign keys
```

## API Endpoints

- `GET /api/health` - Database health check
- `GET /api/seasons` - List all seasons
- `POST /api/seasons` - Create a new season
- `GET /api/seasons/{id}` - Get specific season
- `PUT /api/seasons/{id}` - Update season
- `DELETE /api/seasons/{id}` - Delete season

## Database Schema

### Seasons Table
- `id` (TEXT, PRIMARY KEY) - Unique identifier
- `name` (TEXT) - Season name
- `game` (TEXT) - Video game title
- `sports_type` (TEXT) - Type of sport
- `number_of_players` (INTEGER) - Player count
- `number_of_games` (INTEGER) - Total games in season
- `can_reschedule` (INTEGER) - Boolean for rescheduling allowed
- `day_span_per_game` (INTEGER) - Days between games
- `start_date` (TEXT) - Season start date
- `end_date` (TEXT) - Season end date
- `owner_id` (TEXT) - User identifier
- `status` (TEXT) - Season status (draft/active/completed)
- `created_at` (TEXT) - Creation timestamp

## Environment Variables

- `VITE_API_URL`: API endpoint URL (default: http://localhost:8788/api)
- `VITE_NODE_ENV`: Environment mode (development/production)

## Development Scripts

- `npm run dev:frontend` - Start Vite development server
- `npm run dev:d1:start` - Start Cloudflare Pages dev server with D1 database
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Deployment

This application is designed for deployment on Cloudflare Pages:

1. Build the application: `npm run build`
2. Deploy to Cloudflare Pages
3. Configure D1 database binding in Cloudflare dashboard
4. Apply migrations to production: `npx wrangler d1 migrations apply sports_seasons --remote`

## Tech Stack Details

- **Frontend**: React 18 + TypeScript + Vite 7
- **Build Tool**: Vite with TypeScript support
- **Database**: Cloudflare D1 (SQLite) with migration system
- **API**: Cloudflare Functions with CORS support
- **Styling**: CSS with modern design patterns and ice hockey theme
