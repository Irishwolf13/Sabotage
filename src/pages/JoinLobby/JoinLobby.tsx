import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonModal,} from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges } from '../../firebase/controller';
import { updateAttribute } from '../../stores/gameSlice';
import './JoinLobby.css';

const JoinLobby: React.FC = () => {
  const dispatch = useDispatch();
  const games = useSelector((state: RootState) => state.games);

  const currentGame = games.length > 0 ? games[0] : undefined;
  const isStarted = currentGame?.isStarted;

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (currentGame) {
      const unsubscribe = listenForGameChanges(currentGame.id, (data) => {
        if (data && typeof data.isStarted === 'boolean') {
          dispatch(updateAttribute({ id: currentGame.id, key: 'isStarted', value: data.isStarted }));
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [currentGame, dispatch]);

  useEffect(() => {
    if (isStarted) {
      setShowModal(true);
      setCountdown(3); // Reset countdown

      const interval = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount === 1) {
            clearInterval(interval);
            setShowModal(false);
            console.log("here");
          }
          return prevCount - 1;
        });
      }, 1000);
    }
  }, [isStarted]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>JoinLobby Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50%' }}>
          <h3>{isStarted ? 'Get READY!' : 'Waiting for Host to Start Game...'}</h3>
        </div>

        <IonModal isOpen={showModal} backdropDismiss={false}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>{countdown}</h2>
          </div>
        </IonModal>

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
