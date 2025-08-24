@echo off
REM Database Migration Script for Sports Season System (Windows)
REM Run this script to apply all pending migrations to your local D1 database

echo 🚀 Running Sports Season System Database Migrations...
echo =====================================

REM Check if npx is available
where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npx is not installed. Please install Node.js first.
    exit /b 1
)

echo 📄 Running migration: 0001_create_seasons.sql
npx wrangler d1 execute sports_seasons --local --file=migrations/0001_create_seasons.sql
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Migration 0001_create_seasons.sql failed
    exit /b 1
)
echo ✅ Migration 0001_create_seasons.sql completed successfully
echo.

echo 📄 Running migration: 0002_create_games.sql
npx wrangler d1 execute sports_seasons --local --file=migrations/0002_create_games.sql
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Migration 0002_create_games.sql failed
    exit /b 1
)
echo ✅ Migration 0002_create_games.sql completed successfully
echo.

echo 📄 Running migration: 0003-add-user-seasons.sql
npx wrangler d1 execute sports_seasons --local --file=migrations/0003-add-user-seasons.sql
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Migration 0003-add-user-seasons.sql failed
    exit /b 1
)
echo ✅ Migration 0003-add-user-seasons.sql completed successfully
echo.

echo 📄 Running migration: 0004-add-season-members.sql
npx wrangler d1 execute sports_seasons --local --file=migrations/0004-add-season-members.sql
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Migration 0004-add-season-members.sql failed
    exit /b 1
)
echo ✅ Migration 0004-add-season-members.sql completed successfully
echo.

echo 🎉 All migrations completed successfully!
echo.
echo 📋 Database Tables Created:
echo   - seasons (hockey seasons and games info)
echo   - games (individual game records)
echo   - User_Seasons (season ownership/management)
echo   - Season_Members (season participation/membership)
echo.
echo 💡 To run migrations on production, add --remote flag to wrangler commands
