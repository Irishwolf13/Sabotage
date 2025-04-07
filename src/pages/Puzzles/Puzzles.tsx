import React, { useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Puzzles.css';
import { useAuth } from '../../firebase/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';

const Puzzles: React.FC = () => {
  useGameSubscription()
  const history = useHistory();
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games[0]);

  const navigateToPlayerPage = () => {
    history.push(`/game/${game.id}/player/mainPage`);
  };

  const testButton = () => {
    console.log(game.currentRoom)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Puzzles Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <h1>Puzzles Page</h1>
        <IonButton onClick={testButton}>Test Button</IonButton>
        <IonButton onClick={navigateToPlayerPage}>Solve Puzzle</IonButton>
        <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle size="small">© 2025 Dancing Goat Studios</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Puzzles;
