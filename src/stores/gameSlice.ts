import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Game {
  id: string;
  name: string;
  code: string;
}

type GamesState = Game[];

const initialState: GamesState = [];

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setGames(state, action: PayloadAction<GamesState>) {
      return action.payload;
    },
    addGame(state, action: PayloadAction<Game>) {
      state.push(action.payload);
    },
    removeGame(state, action: PayloadAction<{ id: string }>) { // Updated type for id here
      return state.filter(game => game.id !== action.payload.id);
    },
  },
});

export const { setGames, addGame, removeGame } = gamesSlice.actions;
export default gamesSlice.reducer;
