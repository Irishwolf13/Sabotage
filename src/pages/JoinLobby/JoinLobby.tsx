import React, { useEffect, useState, useCallback } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonList, IonItem } from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges } from '../../firebase/controller';
import { updateAttribute } from '../../stores/gameSlice';
import './JoinLobby.css';
import { auth } from '../../firebase/config';
import StartGameModal from '../../components/Modals/StartGameModal';
import { useRoleId } from '../../components/useRoleId'

const JoinLobby: React.FC = () => {
  const dispatch = useDispatch();
  const games = useSelector((state: RootState) => state.games);
  const currentGame = games.length > 0 ? games[0] : undefined;
  const isStarted = currentGame?.isStarted;

  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
      // console.log(`User email: ${user.email}`);
    }
  }, []);

  // Use the custom hook to manage roleId and players list
  const { roleId, players } = useRoleId(currentGame?.id, email);
  console.log(players)
  useEffect(() => {
    if (currentGame) {
      const unsubscribe = listenForGameChanges(currentGame.id, (data) => {
        if (typeof data.isStarted === 'boolean') {
          dispatch(updateAttribute({ id: currentGame!.id, key: 'isStarted', value: data.isStarted }));
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [currentGame, dispatch]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{email || "User"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50%' }}>
          <h3>{isStarted ? 'Get READY!' : 'Waiting for Host to Start Game...'}</h3>
          <p>Players in Lobby</p>
          <IonList>
            {players.map((player, index) => (
              <IonItem key={index}>
                {player.email}
              </IonItem>
            ))}
          </IonList>
        </div>

        {/* Use the StartGameModal component */}
        <StartGameModal isStarted={!!isStarted} currentGameId={currentGame?.id} roleId={roleId} />
      
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle size="small">© 2025 Dancing Goat Studios</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default JoinLobby;
