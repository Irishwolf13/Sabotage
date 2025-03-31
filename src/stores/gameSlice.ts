import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define Game interface
interface Game {
  id: string;
  name: string;
  code: string;
  players: string[];
  isEnded: boolean;
  isStarted: boolean;
  foundDead: boolean;
}

// Define GamesState type
type GamesState = Game[];

// Initial state
const initialState: GamesState = [];

// Create games slice
const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    // Set games action
    setGames(state, action: PayloadAction<GamesState>) {
      return action.payload;
    },
    // Add game action
    addGame(state, action: PayloadAction<Game>) {
      state.push(action.payload);
    },
    // Remove game action
    removeGame(state, action: PayloadAction<{ id: string }>) {
      return state.filter(game => game.id !== action.payload.id);
    },
    // General update attribute action
    updateAttribute(state, action: PayloadAction<{ id: string; key: keyof Game; value: any }>) {
      const { id, key, value } = action.payload;
      const gameIndex = state.findIndex(game => game.id === id);
      if (gameIndex !== -1) {
        // Update the specific attribute of the game with type assertion
        (state[gameIndex][key] as unknown) = value;
      }
    },
  },
});

// Export actions
export const { setGames, addGame, removeGame, updateAttribute } = gamesSlice.actions;

// Export reducer
export default gamesSlice.reducer;
