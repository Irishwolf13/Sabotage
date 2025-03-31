import React, { useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Saboteur.css';
import { useAuth } from '../../firebase/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges, toggleBooleanField, updatePlayerRoles, getInnocentBaseColors } from '../../firebase/controller';
import { setGames } from '../../stores/gameSlice';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';

const Saboteur: React.FC = () => {
  const game = useSelector((state: RootState) => state.games[0]);
  const history = useHistory();
  const { user } = useAuth();
  const dispatch = useDispatch();

  const navigateToLogin = () => {
    history.push('/login');
  };

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
              foundDead: data.foundDead,
            },
          ])
        );
      });
      return () => unsubscribe();
    }
  }, [dispatch, game?.id]);

  useEffect(() => {
    if (game) {
      console.log('Current Game Info:', game);
    }
  }, [game]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Saboteur</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50%' }}>
          <h1>Saboteur Splash</h1>
          <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
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

export default Saboteur;
