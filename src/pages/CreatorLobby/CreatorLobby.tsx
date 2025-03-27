import React, { useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonButton,
} from '@ionic/react';
import './CreatorLobby.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges, toggleBooleanField } from '../../firebase/controller';
import { setGames } from '../../stores/gameSlice';

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

  const handleToggleStatus = async (key:any, value:any) => {
    await toggleBooleanField(game.id, key, value);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>CreatorLobby Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50%' }}>
          <h1>
            Join Code: <strong>{game.code}</strong>
          </h1>
          <p><strong>{game.name}</strong></p>
          <h2>Players:</h2>
          <ul>
            {game.players && game.players.map((player) => <li key={player}>{player}</li>)}
          </ul>
          <h3>Game Status: {game.isEnded ? 'Ended' : 'In Progress'}</h3>
          <IonButton onClick={() => handleToggleStatus('isEnded', game.isEnded)}>Toggle Game Status</IonButton>
          <IonButton onClick={() => handleToggleStatus('isStarted', game.isStarted)}>Start Game!</IonButton>
        </div>
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