// store.ts

import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './gameSlice';

const store = configureStore({
  reducer: {
    games: gamesReducer,
    // Add more slices here as needed
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;