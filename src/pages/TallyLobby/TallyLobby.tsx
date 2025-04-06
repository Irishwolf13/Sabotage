import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonList, IonRadioGroup, IonItem, IonLabel, IonRadio, IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './TallyLobby.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import { clearVotes } from '../../firebase/controller';

const TallyLobby: React.FC = () => {
  useGameSubscription();
  const history = useHistory();
  const game = useSelector((state: RootState) => state.games[0]);
  const livingPlayers = game?.players?.filter(player => !player.ghost) || [];

  const [showVoterModal, setShowVoterModal] = useState(false);
  const handleVotingComplete = async () => {
    await clearVotes(game.id)
    setShowVoterModal(false);
    history.push(`/game/${game.id}/player/l`);
  };

  const handleTestButton = async () =>  {
    await clearVotes(game.id)
    history.push(`/game/${game.id}/player/l`);
  }

  const handleCheckVotesButton = () => {
    console.log(game.votes.length)
    console.log(livingPlayers.length)
  }

  const voteTimer = (waitTime:number) => {
    const timer = setTimeout(() => {
      setShowVoterModal(true);
    }, waitTime);
    return () => clearTimeout(timer);
  }

  useEffect(() => {
    if (game.votes.length === livingPlayers.length) {
      voteTimer(3000)
    }
  }, [game.votes]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>TallyLobby Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <h1>TallyLobby Page</h1>
        <IonList>
        {/* Going to list out People and their votes here */}
        </IonList>

        {/* Scanner Modal implementation */}
        <IonModal isOpen={showVoterModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Voted Off...</IonTitle>
            <IonButton slot='end' onClick={handleVotingComplete}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {/* This is where some animation or at least a graphic displaying who got voted out goes */}
          </IonContent>
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

export default TallyLobby;
