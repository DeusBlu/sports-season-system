// Unified data service for Cloudflare Pages deployment
// Uses Cloudflare D1 database via Cloudflare Functions

import type { SeasonStatus } from '../constants/seasonStatus';

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
  status?: SeasonStatus;
}

export interface UserSeason {
  User_Season_Id: number;
  User_Id: string;
  Season_Id: string;
  created_at: string;
}

export interface SeasonMember {
  id: number;
  season_id: string;
  user_id: string;
  joined_at: string;
  status: 'active' | 'inactive' | 'pending';
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
      // In test mode, remove from localStorage
      const seasons = this.getLocalStorageSeasons();
      const updatedSeasons = seasons.filter(season => season.id !== seasonId);
      localStorage.setItem('seasons', JSON.stringify(updatedSeasons));
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/seasons/delete/${encodeURIComponent(seasonId)}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete season: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to delete season:', error);
      throw error;
    }
  }

  async adminDeleteSeason(seasonId: string, accessToken: string): Promise<void> {
    if (this.useLocalStorage) {
      // In test mode, remove from localStorage (same as regular delete)
      const seasons = this.getLocalStorageSeasons();
      const updatedSeasons = seasons.filter(season => season.id !== seasonId);
      localStorage.setItem('seasons', JSON.stringify(updatedSeasons));
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/seasons/admin-delete/${encodeURIComponent(seasonId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to admin delete season: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to admin delete season:', error);
      throw error;
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

  // User-specific season methods
  async getAllSeasons(): Promise<Season[]> {
    if (this.useLocalStorage) {
      // In test mode, return all localStorage data
      return this.getLocalStorageSeasons();
    }

    try {
      const response = await fetch(`${this.baseUrl}/seasons/all`);
      if (!response.ok) {
        throw new Error(`Failed to fetch all seasons: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch all seasons:', error);
      return [];
    }
  }

  async getUserOwnedSeasons(userId: string): Promise<Season[]> {
    if (this.useLocalStorage) {
      // In test mode, return mock data
      const allSeasons = this.getLocalStorageSeasons();
      return allSeasons.filter(season => season.ownerId === userId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/seasons/owned/${encodeURIComponent(userId)}`);
      if (!response.ok) {
        // If endpoint doesn't exist (404), fall back to localStorage
        if (response.status === 404) {
          console.log('User-specific API endpoint not found, falling back to localStorage');
          const allSeasons = this.getLocalStorageSeasons();
          return allSeasons.filter(season => season.ownerId === userId);
        }
        throw new Error(`Failed to fetch owned seasons: ${response.status}`);
      }
      
      const text = await response.text();
      // Check if response is HTML (error page) instead of JSON
      if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')) {
        console.log('Received HTML instead of JSON, falling back to localStorage');
        const allSeasons = this.getLocalStorageSeasons();
        return allSeasons.filter(season => season.ownerId === userId);
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to fetch owned seasons:', error);
      // Fall back to localStorage on any error
      const allSeasons = this.getLocalStorageSeasons();
      return allSeasons.filter(season => season.ownerId === userId);
    }
  }

  async getUserMemberSeasons(userId: string): Promise<Season[]> {
    if (this.useLocalStorage) {
      // In test mode, return mock data
      return this.getLocalStorageSeasons().slice(0, 2); // Mock some member seasons
    }

    try {
      const response = await fetch(`${this.baseUrl}/seasons/member/${encodeURIComponent(userId)}`);
      if (!response.ok) {
        // If endpoint doesn't exist (404), fall back to localStorage
        if (response.status === 404) {
          console.log('Member seasons API endpoint not found, falling back to localStorage');
          return this.getLocalStorageSeasons().slice(0, 2); // Mock some member seasons
        }
        throw new Error(`Failed to fetch member seasons: ${response.status}`);
      }
      
      const text = await response.text();
      // Check if response is HTML (error page) instead of JSON
      if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')) {
        console.log('Received HTML instead of JSON for member seasons, falling back to localStorage');
        return this.getLocalStorageSeasons().slice(0, 2); // Mock some member seasons
      }
      
      const seasons = JSON.parse(text);
      return seasons;
    } catch (error) {
      console.error('Failed to fetch member seasons:', error);
      // Fall back to localStorage on any error
      return this.getLocalStorageSeasons().slice(0, 2); // Mock some member seasons
    }
  }

  async createSeasonWithOwnership(season: Season, userId: string): Promise<Season> {
    // Set the owner ID and initial status before creating
    const seasonWithOwner = { 
      ...season, 
      ownerId: userId,
      status: 'preseason' as SeasonStatus
    };
    
    if (this.useLocalStorage) {
      // Create season in localStorage
      const seasons = this.getLocalStorageSeasons();
      const newSeason = {
        ...seasonWithOwner,
        id: `season-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      seasons.push(newSeason);
      localStorage.setItem('seasons', JSON.stringify(seasons));
      console.log('Season created:', newSeason);
      
      // In localStorage mode, we can't easily simulate the member addition
      // but we log it for development purposes
      console.log(`User ${userId} automatically added as member to season ${newSeason.id}`);
      
      return newSeason;
    }

    try {
      const response = await fetch(`${this.baseUrl}/seasons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seasonWithOwner),
      });

      if (!response.ok) {
        throw new Error(`Failed to create season: ${response.status}`);
      }

      const createdSeason = await response.json();
      
      // Automatically add the owner as a member
      try {
        await this.joinSeason(createdSeason.id, userId);
        console.log(`Owner ${userId} automatically added as member to season ${createdSeason.id}`);
      } catch (memberError) {
        console.warn('Failed to automatically add owner as member:', memberError);
        // Don't fail the season creation if member addition fails
      }

      return createdSeason;
    } catch (error) {
      console.error('Failed to create season:', error);
      throw error;
    }
  }

  async joinSeason(seasonId: string, userId: string): Promise<void> {
    if (this.useLocalStorage) {
      // In test mode, just log the action
      console.log(`User ${userId} joined season ${seasonId}`);
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/seasons/${seasonId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to join season: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to join season:', error);
      throw error;
    }
  }

  async leaveSeason(seasonId: string, userId: string): Promise<void> {
    if (this.useLocalStorage) {
      // In test mode, just log the action
      console.log(`User ${userId} left season ${seasonId}`);
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/seasons/${seasonId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to leave season: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to leave season:', error);
      throw error;
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
