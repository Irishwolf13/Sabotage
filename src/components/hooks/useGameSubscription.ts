import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listenForGameChanges } from '../../firebase/controller';
import { setGames } from '../../stores/gameSlice';
import { RootState } from '../../stores/store';
import { useAuth } from '../../firebase/AuthContext';

export const useGameSubscription = () => {
  const game = useSelector((state: RootState) => state.games[0]);
  const { user } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (game?.id) {
      const unsubscribe = listenForGameChanges(game.id, (data) => {
        if (user) {
          // Update necessary fields while retaining others
          dispatch(
            setGames([
              {
                ...game, // Spread existing properties to retain their values
                name: data.gameName,
                code: data.gameCode,
                players: data.players,
                isEnded: data.isEnded,
                isStarted: data.isStarted,
                saboteurWins: data.saboteurWins,
                foundDead: data.foundDead,
                isVoting: data.isVoting,
                isPlayerDead: data.isPlayerDead,
                isAlarmActive: data.isAlarmActive,
                alarmDetonated: data.alarmDetonated,
                calledMeeting: data.calledMeeting,
                allVotesCast: data.allVotesCast,
                kickedPlayer: data.kickedPlayer,
                alarmInfo: data.alarmInfo,
                gameRound: data.gameRound,
              },
            ])
          );
        }
      });
      return () => unsubscribe();
    }
  }, [dispatch, game?.id, user?.email]);
};
