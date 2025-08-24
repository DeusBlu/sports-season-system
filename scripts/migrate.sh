#!/bin/bash

# Database Migration Script for Sports Season System
# Run this script to apply all pending migrations to your local D1 database

echo "🚀 Running Sports Season System Database Migrations..."
echo "=====================================";

# Check if wrangler is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not installed. Please install Node.js first."
    exit 1
fi

# Run migrations in order
migrations=(
    "0001_create_seasons.sql"
    "0002_create_games.sql" 
    "0003-add-user-seasons.sql"
    "0004-add-season-members.sql"
)

for migration in "${migrations[@]}"; do
    echo "📄 Running migration: $migration"
    
    if npx wrangler d1 execute sports_seasons --local --file="migrations/$migration"; then
        echo "✅ Migration $migration completed successfully"
    else
        echo "❌ Migration $migration failed"
        exit 1
    fi
    echo ""
done

echo "🎉 All migrations completed successfully!"
echo ""
echo "📋 Database Tables Created:"
echo "  - seasons (hockey seasons and games info)"
echo "  - games (individual game records)"
echo "  - User_Seasons (season ownership/management)"
echo "  - Season_Members (season participation/membership)"
echo ""
echo "💡 To run migrations on production, add --remote flag to wrangler commands"
