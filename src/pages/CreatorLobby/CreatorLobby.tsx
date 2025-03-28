import React, { useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonButton,
  IonList,
  IonItem,
} from '@ionic/react';
import './CreatorLobby.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges, toggleBooleanField } from '../../firebase/controller';
import { setGames } from '../../stores/gameSlice';
import { assignPlayersToRooms } from '../../components/roomAssignment';

const CreatorLobby: React.FC = () => {
  const dispatch = useDispatch();
  const game = useSelector((state: RootState) => state.games[0]);

  useEffect(() => {
    if (game?.id) {
      const unsubscribe = listenForGameChanges(game.id, (data) => {
        dispatch(
          setGames([
            {
              id: game.id,
              name: data.gameName,
              code: data.gameCode,
              players: data.players,
              isEnded: data.isEnded,
              isStarted: data.isStarted,
              isDead: data.isDead,
            },
          ])
        );
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [dispatch, game?.id]); // Listening for game.id changes

  if (!game) {
    return <p>No game available</p>;
  }

  const handleToggleStatus = async (key: any, value: any) => {
    await toggleBooleanField(game.id, key, value);
  };

  const handleStartGame = async () => {
    handleToggleStatus('isStarted', game.isStarted);
    
    // Call the room assignment function here
    const rooms = assignPlayersToRooms(7,7);

    // Log the results or handle them as needed
    rooms.forEach((room, index) => {
      console.log(`Room ${index + 1}: Players ${room.map(p => p + 1).join(', ')}`);
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>CreatorLobby Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <h1>
          Join Code: <strong>{game.code}</strong>
        </h1>
        <h3>{game.isStarted ? 'Get Ready!' : 'In Lobby'}</h3>
        <IonList>
          {Array.from({ length: 8 }).map((_, index) => (
            <IonItem key={index}>
              {game.players && game.players[index] ? game.players[index] : "Open Slot"}
            </IonItem>
          ))}
        </IonList>
        <IonButton onClick={handleStartGame}>Start Game!</IonButton>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle size="small">© 2025 Dancing Goat Studios</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default CreatorLobby;
