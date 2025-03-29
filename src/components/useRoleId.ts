import { useState, useEffect, useCallback } from 'react';
import { listenForGameChanges } from '../firebase/controller';

export const useRoleId = (currentGameId: string | undefined, email: string | null) => {
  const [roleId, setRoleId] = useState<string>("1");
  const [players, setPlayers] = useState<string[]>([]);

  const handleGameChange = useCallback(
    (data: any) => {
      if (data.players) {
        setPlayers(data.players);
      }

      if (data.roles?.saboteur.includes(email)) {
        setRoleId("l");
        // console.log('Saboteur role detected, setting roleId to "l"');
      } else {
        setRoleId("1");
        // console.log('Default player role assigned, setting roleId to "1"');
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
