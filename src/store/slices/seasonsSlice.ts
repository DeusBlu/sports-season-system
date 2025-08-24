import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { dataService, type Season } from '../../services/dataService';

interface SeasonsState {
  ownedSeasons: Season[];
  memberSeasons: Season[];
  allSeasons: Season[]; // For admin view
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: SeasonsState = {
  ownedSeasons: [],
  memberSeasons: [],
  allSeasons: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks for API calls
export const loadUserSeasons = createAsyncThunk(
  'seasons/loadUserSeasons',
  async (userId: string) => {
    const [owned, member] = await Promise.all([
      dataService.getUserSeasons(userId),
      dataService.getUserMemberSeasons(userId)
    ]);
    return { owned, member };
  }
);

export const loadAllSeasons = createAsyncThunk(
  'seasons/loadAllSeasons',
  async () => {
    return await dataService.getAllSeasons();
  }
);

export const createSeason = createAsyncThunk(
  'seasons/createSeason',
  async ({ seasonData, userId }: { seasonData: Omit<Season, 'id'>; userId: string }) => {
    return await dataService.createSeasonWithOwnership(seasonData, userId);
  }
);

export const deleteSeason = createAsyncThunk(
  'seasons/deleteSeason',
  async (seasonId: string) => {
    await dataService.deleteSeason(seasonId);
    return seasonId;
  }
);

export const adminDeleteSeason = createAsyncThunk(
  'seasons/adminDeleteSeason',
  async ({ seasonId, accessToken }: { seasonId: string; accessToken: string }) => {
    await dataService.adminDeleteSeason(seasonId, accessToken);
    return seasonId;
  }
);

const seasonsSlice = createSlice({
  name: 'seasons',
  initialState,
  reducers: {
    clearSeasons: (state) => {
      state.ownedSeasons = [];
      state.memberSeasons = [];
      state.allSeasons = [];
      state.lastUpdated = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic updates
    addSeasonOptimistic: (state, action: PayloadAction<Season>) => {
      state.ownedSeasons.push(action.payload);
    },
    removeSeasonOptimistic: (state, action: PayloadAction<string>) => {
      const seasonId = action.payload;
      state.ownedSeasons = state.ownedSeasons.filter(s => s.id !== seasonId);
      state.memberSeasons = state.memberSeasons.filter(s => s.id !== seasonId);
      state.allSeasons = state.allSeasons.filter(s => s.id !== seasonId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user seasons
      .addCase(loadUserSeasons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserSeasons.fulfilled, (state, action) => {
        state.loading = false;
        state.ownedSeasons = action.payload.owned;
        state.memberSeasons = action.payload.member;
        state.lastUpdated = Date.now();
      })
      .addCase(loadUserSeasons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load user seasons';
      })
      
      // Load all seasons (admin)
      .addCase(loadAllSeasons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAllSeasons.fulfilled, (state, action) => {
        state.loading = false;
        state.allSeasons = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(loadAllSeasons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load all seasons';
      })
      
      // Create season
      .addCase(createSeason.fulfilled, (state, action) => {
        // Add to owned seasons if not already there
        const exists = state.ownedSeasons.find(s => s.id === action.payload.id);
        if (!exists) {
          state.ownedSeasons.push(action.payload);
        }
        // Also add to allSeasons if it's loaded
        if (state.allSeasons.length > 0) {
          const existsInAll = state.allSeasons.find(s => s.id === action.payload.id);
          if (!existsInAll) {
            state.allSeasons.push(action.payload);
          }
        }
        state.lastUpdated = Date.now();
      })
      .addCase(createSeason.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create season';
      })
      
      // Delete season
      .addCase(deleteSeason.fulfilled, (state, action) => {
        const seasonId = action.payload;
        state.ownedSeasons = state.ownedSeasons.filter(s => s.id !== seasonId);
        state.memberSeasons = state.memberSeasons.filter(s => s.id !== seasonId);
        state.allSeasons = state.allSeasons.filter(s => s.id !== seasonId);
        state.lastUpdated = Date.now();
      })
      .addCase(deleteSeason.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete season';
      })
      
      // Admin delete season
      .addCase(adminDeleteSeason.fulfilled, (state, action) => {
        const seasonId = action.payload;
        state.ownedSeasons = state.ownedSeasons.filter(s => s.id !== seasonId);
        state.memberSeasons = state.memberSeasons.filter(s => s.id !== seasonId);
        state.allSeasons = state.allSeasons.filter(s => s.id !== seasonId);
        state.lastUpdated = Date.now();
      })
      .addCase(adminDeleteSeason.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to admin delete season';
      });
  },
});

export const { 
  clearSeasons, 
  clearError, 
  addSeasonOptimistic, 
  removeSeasonOptimistic 
} = seasonsSlice.actions;

export default seasonsSlice.reducer;

// Selectors
export const selectOwnedSeasons = (state: { seasons: SeasonsState }) => state.seasons.ownedSeasons;
export const selectMemberSeasons = (state: { seasons: SeasonsState }) => state.seasons.memberSeasons;
export const selectAllSeasons = (state: { seasons: SeasonsState }) => state.seasons.allSeasons;
export const selectSeasonsLoading = (state: { seasons: SeasonsState }) => state.seasons.loading;
export const selectSeasonsError = (state: { seasons: SeasonsState }) => state.seasons.error;
export const selectAllUserSeasons = (state: { seasons: SeasonsState }) => [
  ...state.seasons.ownedSeasons,
  ...state.seasons.memberSeasons
].filter((season, index, self) => 
  index === self.findIndex(s => s.id === season.id)
); // Remove duplicates
