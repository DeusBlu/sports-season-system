import { configureStore } from '@reduxjs/toolkit';
import seasonsReducer from './slices/seasonsSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    seasons: seasonsReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
