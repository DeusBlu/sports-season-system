# Sports Season System

A React TypeScript application for tracking private user sports seasons, specifically designed for digital video game hockey matches. Built with Vite and deployable to Cloudflare Pages with MongoDB Atlas integration.

## Features

- **Digital Hockey Season Management**: Track your video game hockey seasons across multiple games (NHL 25, Wayne Gretzky Hockey, etc.)
- **Calendar View**: Outlook-style calendar for viewing scheduled games with home/away indicators
- **Dual Environment Support**: Works in development with localStorage and production with MongoDB Atlas
- **Serverless Deployment**: Optimized for Cloudflare Pages deployment

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router
- **Calendar**: React Big Calendar with Moment.js
- **Database**: MongoDB Atlas Data API (production) / localStorage (development)
- **Deployment**: Cloudflare Pages
- **Styling**: CSS with ice hockey theme (blue/white gradient, orange/black accents)

## Development Setup

### Prerequisites

- Node.js 20.19+ (tested with 22.18.0)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure your MongoDB connection:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/sports-seasons
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
  ├── services/
  │   └── mongoService.ts    # API service for backend communication
  ├── App.tsx               # Main application component
  ├── App.css              # Main styles
  └── main.tsx             # Entry point
```

## Backend Integration

This frontend is designed to work with a backend API that handles MongoDB connections. The API service is configured to communicate with your backend server.

**Note**: Direct MongoDB connections from the frontend are not recommended for production. This app expects a backend API to handle database operations.

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: http://localhost:3001/api)
- `MONGODB_URI`: MongoDB connection string (for backend use)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Database**: MongoDB (via backend API)
- **Styling**: CSS with modern design patterns
