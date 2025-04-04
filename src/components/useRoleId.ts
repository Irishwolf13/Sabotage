import { useState, useEffect, useCallback } from 'react';
import { listenForGameChanges } from '../firebase/controller';

export const useRoleId = (currentGameId: string | undefined, email: string | null) => {
  const [roleId, setRoleId] = useState<string>("1");
  const [players, setPlayers] = useState<{ 
    color: string; 
    email: string; 
    ghost: boolean; 
    isSaboteur: boolean; 
    screenName: string; 
  }[]>([]);

  const handleGameChange = useCallback(
    (data: any) => {
      console.log('iran')
      console.log(players)
      if (data.players) {
        setPlayers(data.players); // Set the entire array of player objects
        
        // Check if current user is a saboteur
        if (data.players.some((player: { email: string; isSaboteur: boolean }) => player.email === email && player.isSaboteur)) {
          setRoleId("l"); // Saboteur detected
        } else {
          setRoleId("1"); // Default role
        }
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

  return { roleId, players };
};
