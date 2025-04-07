import React, { useState, useEffect } from 'react';
import { 
  IonButton, 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonFooter, 
  IonList, 
  IonItem, 
  IonModal, 
  IonLabel
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './TallyLobby.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import { clearVotes, evaluateVotes, evaluateGameStatus } from '../../firebase/controller';
import { useAuth } from '../../firebase/AuthContext';

interface gameResults { gameOver: boolean; innocentsWin: boolean;}

const TallyLobby: React.FC = () => {
  useGameSubscription();
  const { user } = useAuth(); 
  const history = useHistory();
  const game = useSelector((state: RootState) => state.games[0]);
  const livingPlayers = game?.players?.filter(player => !player.ghost) || [];

  const [showVoterModal, setShowVoterModal] = useState(false);
  const [showPlayerVotedOff, setShowPlayerVotedOff] = useState('');
  const [showTextChanged, setShowTextChanged] = useState('Waiting for all votes to be cast...');

  const handleVotingComplete = async () => {
    console.log('Living Players')
    console.log(livingPlayers)
    console.log(game)
    if (game) {
      await clearVotes(game.id);
      setShowVoterModal(false);
      const playerIsAlive = livingPlayers.some((player: { email: string }) => player.email === user?.email);
      if (!playerIsAlive) {
        history.push(`/game/${game.id}/votedOff`);
        return;
      }
      if (game.isEnded && !game.saboteurWins) {
        // Innocents wins
        history.push(`/game/${game.id}/endGame`);
      } else if (game.isEnded && game.saboteurWins){
        // Saboteur wins
        history.push(`/game/${game.id}/endGame`);
      } else if (!game.isEnded){
        // Default
        history.push(`/game/${game.id}/player/mainPage`);
      }
    }
  };

  const handleCheckVotesButton = () => {
    setShowVoterModal(true);
  };
  
  useEffect(() => {
    if (game.votes && livingPlayers) {
      if (game.votes.length === livingPlayers.length) {
        
        evaluateVotes(game.id).then(result => {
          if (result) {
            console.log(result.email);
            setShowPlayerVotedOff(result.email);
          }
          
          setShowTextChanged('Tallying all the votes...');
  
          // Use .then() to handle the promise from evaluateGameStatus
          evaluateGameStatus(game.id).then(result => {
            console.log('Game results here');
            console.log(game); // Log the game status results
            console.log('End game results');
          });
  
          const modalTimer = setTimeout(() => {
            setShowVoterModal(true);
          }, 2000);
  
          const textChangeTimer = setTimeout(() => {
            setShowTextChanged('Waiting for all votes to be cast...');
          }, 2500);
  
          return () => {
            clearTimeout(modalTimer);
            clearTimeout(textChangeTimer);
          };
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
        <h1>{showTextChanged}</h1>
        <IonList>
          {game.votes && game.votes.map((vote, index) => (
            <IonItem key={index}>
              <IonLabel>{vote.voter}</IonLabel>
            </IonItem>
          ))}
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
            {showPlayerVotedOff} was kicked!
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

