-- Migration: Add Season_Members table
-- This table tracks which users are members/participants in which seasons

CREATE TABLE IF NOT EXISTS Season_Members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    UNIQUE(season_id, user_id) -- Prevent duplicate memberships
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_season_members_season_id ON Season_Members(season_id);
CREATE INDEX IF NOT EXISTS idx_season_members_user_id ON Season_Members(user_id);
CREATE INDEX IF NOT EXISTS idx_season_members_status ON Season_Members(status);
