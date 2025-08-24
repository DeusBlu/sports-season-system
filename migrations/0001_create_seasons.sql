-- Migration 0001: Create seasons table
CREATE TABLE seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT,
  sports_type TEXT,
  sport TEXT,
  number_of_players INTEGER,
  number_of_games INTEGER,
  can_reschedule INTEGER DEFAULT 0,
  day_span_per_game INTEGER,
  start_date TEXT,
  end_date TEXT,
  owner_id TEXT DEFAULT 'user-1',
  status TEXT DEFAULT 'draft',
  created_at TEXT NOT NULL
);

-- Create index for better query performance
CREATE INDEX idx_seasons_owner_id ON seasons(owner_id);
CREATE INDEX idx_seasons_status ON seasons(status);
CREATE INDEX idx_seasons_created_at ON seasons(created_at);
