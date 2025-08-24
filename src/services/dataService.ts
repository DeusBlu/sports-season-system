// Unified data service for Cloudflare Pages deployment
// Uses Cloudflare D1 database via Cloudflare Functions

export interface Season {
  id?: string;
  name: string;
  game?: string;
  sportsType?: string;
  sport?: string;
  numberOfPlayers?: number;
  numberOfGames?: number;
  canReschedule?: boolean;
  daySpanPerGame?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  ownerId?: string;
  status?: 'draft' | 'active' | 'completed';
}

export interface HockeyGame {
  id?: string;
  seasonId: string;
  title: string;
  start: Date;
  end: Date;
  isMyGame: boolean;
  opponent?: string;
  gameType: 'scheduled' | 'completed' | 'cancelled';
  isHome: boolean;
  playerId?: string;
}

class DataService {
  private baseUrl: string;

  constructor() {
    // Uses Cloudflare Functions with D1 database
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    console.log('DataService initialized with baseUrl:', this.baseUrl);
    console.log('Environment variables:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('D1 connection failed:', error);
      return false;
    }
  }

  // Season operations
  async createSeason(season: Omit<Season, 'id'>): Promise<Season> {
    const response = await fetch(`${this.baseUrl}/seasons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...season,
        createdAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create season: ${response.status}`);
    }

    return await response.json();
  }

  async getSeasons(ownerId?: string): Promise<Season[]> {
    const url = ownerId ? `${this.baseUrl}/seasons?ownerId=${ownerId}` : `${this.baseUrl}/seasons`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to get seasons: ${response.status}`);
    }

    return await response.json();
  }

  async getSeason(seasonId: string): Promise<Season | null> {
    const response = await fetch(`${this.baseUrl}/seasons/${seasonId}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get season: ${response.status}`);
    }

    return await response.json();
  }

  async updateSeason(seasonId: string, updates: Partial<Season>): Promise<Season> {
    const response = await fetch(`${this.baseUrl}/seasons/${seasonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update season: ${response.status}`);
    }

    return await response.json();
  }

  async deleteSeason(seasonId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/seasons/${seasonId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete season: ${response.status}`);
    }
  }

  // Game operations
  async createGame(game: Omit<HockeyGame, 'id'>): Promise<HockeyGame> {
    const response = await fetch(`${this.baseUrl}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(game)
    });

    if (!response.ok) {
      throw new Error(`Failed to create game: ${response.status}`);
    }

    return await response.json();
  }

  async getGames(seasonId?: string): Promise<HockeyGame[]> {
    const url = seasonId ? `${this.baseUrl}/games?seasonId=${seasonId}` : `${this.baseUrl}/games`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to get games: ${response.status}`);
    }

    return await response.json();
  }

  async updateGame(gameId: string, updates: Partial<HockeyGame>): Promise<HockeyGame> {
    const response = await fetch(`${this.baseUrl}/games/${gameId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update game: ${response.status}`);
    }

    return await response.json();
  }

  async deleteGame(gameId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/games/${gameId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete game: ${response.status}`);
    }
  }
}

export const dataService = new DataService();
