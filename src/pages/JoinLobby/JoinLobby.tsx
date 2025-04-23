import React, { useEffect, useState, useCallback } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonList, IonItem } from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges } from '../../firebase/controller';
import { updateAttribute } from '../../stores/gameSlice';
import './JoinLobby.css';
import { auth } from '../../firebase/config';
import StartGameModal from '../../components/Modals/StartGameModal';
import { setPlayers } from '../../components/setPlayers'

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
  const { players } = setPlayers(currentGame?.id, email);

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
      <IonContent fullscreen>
        <div className='mainPageButtonHolder'>
          <h3 className='coloredText'>{isStarted ? 'Get READY!' : 'Waiting for Host to Start Game...'}</h3>
          <p className='coloredText'>Players in Lobby</p>
          <div className='flex2Col'>
            {players.map((player, index) => (
              <div className='lobbyItem' key={index}>{player.screenName}</div>
            ))}
          </div>
        </div>
        <StartGameModal isStarted={!!isStarted} currentGameId={currentGame?.id}/>
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
