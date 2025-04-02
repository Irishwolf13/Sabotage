import React, { useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonButton } from '@ionic/react';
import './PlayerLobby.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges } from '../../firebase/controller';
import { setGames } from '../../stores/gameSlice';

const PlayerLobby: React.FC = () => {
  const dispatch = useDispatch();
  const game = useSelector((state: RootState) => state.games[0]);

  useEffect(() => {
    if (game) {
      const unsubscribe = listenForGameChanges(game.id, (data) => {
        dispatch(setGames([{ 
          id: game.id,
          name: data.gameName,
          code: data.gameCode,
          players: data.players,
          isEnded: data.isEnded,
          isStarted: data.isStarted,
          foundDead: data.foundDead,
          color: '',
        }]));
      });

      return () => unsubscribe();
    }
  }, [dispatch, game]);

  if (!game) {
    return <p>No game available</p>;
  }

  // Function to handle button click
  // const handleToggleStatus = async () => {
  //   await toggleGameEndedStatus(game.id, !game.isEnded);
  // };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>PlayerLobby Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50%' }}>
          <h1>Join Code: <strong>{game.code}</strong></h1>
          <p><strong>{game.name}</strong></p>
          <h2>Players:</h2>
          <ul>
            {game.players && game.players.map(player => (
              <li key={player}>{player}</li>
            ))}
          </ul>
          <h3>Game Status: {game.isEnded ? "Ended" : "In Progress"}</h3>
          {/* <IonButton onClick={handleToggleStatus}>
            Toggle Game Status
          </IonButton> */}
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

export default PlayerLobby;
