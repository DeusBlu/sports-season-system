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
  private useLocalStorage: boolean;

  constructor() {
    // Use localStorage for testing in test environment
    this.useLocalStorage = (import.meta.env.VITE_NODE_ENV === 'test' ||
                          import.meta.env.NODE_ENV === 'test') && 
                          typeof window !== 'undefined' && 
                          window.localStorage;
    
    // Uses Cloudflare Functions with D1 database
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    console.log('DataService initialized with baseUrl:', this.baseUrl);
    console.log('Using localStorage:', this.useLocalStorage);
    console.log('Environment variables:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
      NODE_ENV: import.meta.env.NODE_ENV
    });
  }

  async testConnection(): Promise<boolean> {
    if (this.useLocalStorage) {
      // In test mode with localStorage, always return true
      return true;
    }
    
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
    if (this.useLocalStorage) {
      const seasons = this.getLocalStorageSeasons();
      const newSeason: Season = {
        ...season,
        id: `season-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      seasons.push(newSeason);
      localStorage.setItem('seasons', JSON.stringify(seasons));
      return newSeason;
    }

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
    if (this.useLocalStorage) {
      const seasons = this.getLocalStorageSeasons();
      return ownerId ? seasons.filter(s => s.ownerId === ownerId) : seasons;
    }

    const url = ownerId ? `${this.baseUrl}/seasons?ownerId=${ownerId}` : `${this.baseUrl}/seasons`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to get seasons: ${response.status}`);
    }

    return await response.json();
  }

  async getSeason(seasonId: string): Promise<Season | null> {
    if (this.useLocalStorage) {
      const seasons = this.getLocalStorageSeasons();
      return seasons.find(s => s.id === seasonId) || null;
    }

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
    if (this.useLocalStorage) {
      const seasons = this.getLocalStorageSeasons();
      const seasonIndex = seasons.findIndex(s => s.id === seasonId);
      if (seasonIndex === -1) {
        throw new Error(`Season not found: ${seasonId}`);
      }
      seasons[seasonIndex] = { ...seasons[seasonIndex], ...updates };
      localStorage.setItem('seasons', JSON.stringify(seasons));
      return seasons[seasonIndex];
    }

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
    if (this.useLocalStorage) {
      const seasons = this.getLocalStorageSeasons();
      const filteredSeasons = seasons.filter(s => s.id !== seasonId);
      localStorage.setItem('seasons', JSON.stringify(filteredSeasons));
      return;
    }

    const response = await fetch(`${this.baseUrl}/seasons/${seasonId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete season: ${response.status}`);
    }
  }

  // Game operations
  async createGame(game: Omit<HockeyGame, 'id'>): Promise<HockeyGame> {
    if (this.useLocalStorage) {
      const games = this.getLocalStorageGames();
      const newGame: HockeyGame = {
        ...game,
        id: `game-${Date.now()}`
      };
      games.push(newGame);
      localStorage.setItem('games', JSON.stringify(games));
      return newGame;
    }

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
    if (this.useLocalStorage) {
      const games = this.getLocalStorageGames();
      return seasonId ? games.filter(g => g.seasonId === seasonId) : games;
    }

    const url = seasonId ? `${this.baseUrl}/games?seasonId=${seasonId}` : `${this.baseUrl}/games`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to get games: ${response.status}`);
    }

    return await response.json();
  }

  async updateGame(gameId: string, updates: Partial<HockeyGame>): Promise<HockeyGame> {
    if (this.useLocalStorage) {
      const games = this.getLocalStorageGames();
      const gameIndex = games.findIndex(g => g.id === gameId);
      if (gameIndex === -1) {
        throw new Error(`Game not found: ${gameId}`);
      }
      games[gameIndex] = { ...games[gameIndex], ...updates };
      localStorage.setItem('games', JSON.stringify(games));
      return games[gameIndex];
    }

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
    if (this.useLocalStorage) {
      const games = this.getLocalStorageGames();
      const filteredGames = games.filter(g => g.id !== gameId);
      localStorage.setItem('games', JSON.stringify(filteredGames));
      return;
    }

    const response = await fetch(`${this.baseUrl}/games/${gameId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete game: ${response.status}`);
    }
  }

  // localStorage helper methods for testing
  private getLocalStorageSeasons(): Season[] {
    try {
      const data = localStorage.getItem('seasons');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getLocalStorageGames(): HockeyGame[] {
    try {
      const data = localStorage.getItem('games');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export const dataService = new DataService();
