import { useState, useEffect, useCallback } from 'react';
import { listenForGameChanges } from '../firebase/controller';

export const setPlayers = (currentGameId: string | undefined, email: string | null) => {
  const [players, setPlayers] = useState<{
    email: string; 
    ghost: boolean; 
    isSaboteur: boolean; 
    screenName: string; 
  }[]>([]);

  const handleGameChange = useCallback(
    (data: any) => {
      if (data.players) {
        setPlayers(data.players); // Set the entire array of player objects
      }
    },
    [email]
  );

  useEffect(() => {
    if (currentGameId) {
      const unsubscribe = listenForGameChanges(currentGameId, handleGameChange);
      return () => unsubscribe();
    }
  }, [currentGameId, handleGameChange]);

  return { players };
};
