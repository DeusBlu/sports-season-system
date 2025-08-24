-- Migration: Add User_Seasons table
-- This table tracks which users own/manage which seasons

CREATE TABLE IF NOT EXISTS User_Seasons (
    User_Season_Id INTEGER PRIMARY KEY AUTOINCREMENT,
    User_Id TEXT NOT NULL,
    Season_Id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Season_Id) REFERENCES seasons(id) ON DELETE CASCADE,
    UNIQUE(User_Id, Season_Id) -- Prevent duplicate ownership entries
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_seasons_user_id ON User_Seasons(User_Id);
CREATE INDEX IF NOT EXISTS idx_user_seasons_season_id ON User_Seasons(Season_Id);
