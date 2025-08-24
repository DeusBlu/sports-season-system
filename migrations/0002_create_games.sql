-- Migration 0002: Create games table
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_my_game INTEGER DEFAULT 0,
  opponent TEXT,
  game_type TEXT DEFAULT 'scheduled',
  is_home INTEGER DEFAULT 0,
  player_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_games_season_id ON games(season_id);
CREATE INDEX idx_games_start_time ON games(start_time);
CREATE INDEX idx_games_player_id ON games(player_id);
