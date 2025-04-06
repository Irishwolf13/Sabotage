import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonList, IonRadioGroup, IonItem, IonLabel, IonRadio, IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './TallyLobby.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import { clearVotes, evaluateVotes } from '../../firebase/controller';

const TallyLobby: React.FC = () => {
  useGameSubscription();
  const history = useHistory();
  const game = useSelector((state: RootState) => state.games[0]);
  const livingPlayers = game?.players?.filter(player => !player.ghost) || [];

  const [showVoterModal, setShowVoterModal] = useState(false);
  const [showTextForUser, setShowTextForUser] = useState('');

  const handleVotingComplete = async () => {
    await clearVotes(game.id)
    setShowVoterModal(false);
    history.push(`/game/${game.id}/player/l`);
  };

  const handleCheckVotesButton = () => {
    setShowVoterModal(true);
  }
  
  useEffect(() => {
    if (game.votes && livingPlayers) {
      if (game.votes.length === livingPlayers.length) {
        setShowTextForUser('Everyone has voted, and the winner is...');
        
        // Use .then() to handle the promise from evaluateVotes
        evaluateVotes(game.id).then(result => {
          if (result) {
            console.log(result.email)
            setShowTextForUser(result.email);
          }
          
          const timer = setTimeout(() => {
            setShowVoterModal(true);
          }, 2000);
  
          return () => clearTimeout(timer);
        });
      }
    }
  }, [game.votes, livingPlayers]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>TallyLobby Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonButton onClick={handleCheckVotesButton}>Test Button</IonButton>
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
          {showTextForUser} was kicked!
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
