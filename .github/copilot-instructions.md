<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Sports Season System - Copilot Instructions

This is a React TypeScript application with Vite for tracking private user sports seasons. The application connects to a MongoDB database through a backend API.

## Project Structure
- Frontend: React + TypeScript + Vite
- Backend: API service (to be implemented) that connects to MongoDB
- Database: MongoDB for storing sports season data

## Key Guidelines
1. Keep the frontend focused on UI/UX and API communication
2. MongoDB connections should be handled by the backend API, not directly in the frontend
3. Use TypeScript for type safety
4. Follow React best practices and hooks patterns
5. Environment variables should be prefixed with `VITE_` for frontend use
6. Keep the codebase minimal and focused - only implement features that have immediate use

## API Service Pattern
- Use the `dataService` in `src/services/dataService.ts` for all data operations
- Automatically switches between development (localStorage) and production (MongoDB Atlas Data API)
- Handle loading states and error cases gracefully

## Current State
- Basic React app setup with connection status display
- Unified data service with development/production modes
- Environment configuration for localStorage (dev) and MongoDB Atlas (prod)
- Modern, responsive UI design ready for sports season features
