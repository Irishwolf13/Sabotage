import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define Game interface
export interface Game {
  id: string;
  name: string;
  code: string;
  isEnded: boolean;
  gameRound: number;
  saboteurWins: boolean;
  isStarted: boolean;
  foundDead: boolean;
  isVoting: boolean;
  isPlayerDead: boolean;
  isAlarmActive: boolean;
  alarmDetonated: boolean;
  currentRoom: number;
  calledMeeting: string;
  allVotesCast: boolean;
  kickedPlayer: string;
  players: Player[];
  alarmInfo: AlarmInfo;
}

// Game Settings interface
export interface AlarmInfo {
  alarmTimer: number;
  alarmScanner1: boolean;
  alarmScanner2: boolean;
}

// Define Player interface
export interface Player {
  screenName: string;
  email: string;
  ghost: boolean;
  isSaboteur: boolean;
  votes?: { voter: string; selected: string; gameRound: number }[];
  rooms?: { solved: boolean; puzzleNumber: number }[];
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
    removeGame() {
      return [];
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
