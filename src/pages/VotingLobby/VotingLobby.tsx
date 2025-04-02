import React from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './VotingLobby.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';

const VotingLobby: React.FC = () => {
  useGameSubscription()
  const history = useHistory();
  const game = useSelector((state: RootState) => state.games[0]);

  const navigateToPlayerPage = () => {
    console.log(game)
    if (game.isSaboteur) {
        history.push(`/game/${game.id}/player/l`);
    } else {
        history.push(`/game/${game.id}/player/1`);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>VotingLobby Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <h1>VotingLobby Page</h1>
        <IonButton onClick={navigateToPlayerPage}>Cast Vote</IonButton>
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

export default VotingLobby;
