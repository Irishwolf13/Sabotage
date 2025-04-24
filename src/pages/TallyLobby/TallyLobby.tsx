import React, { useState, useEffect } from 'react';
import { 
  IonButton, 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonFooter, 
  IonModal 
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './TallyLobby.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import { clearVotes, evaluateVotes, evaluateGameStatus, toggleBooleanField, updateStringField } from '../../firebase/controller';
import { useAuth } from '../../firebase/AuthContext';

interface gameResults { gameOver: boolean; innocentsWin: boolean;}

const TallyLobby: React.FC = () => {
  useGameSubscription();
  const { user } = useAuth(); 
  const history = useHistory();
  const game = useSelector((state: RootState) => state.games[0]);
  const livingPlayers = game?.players?.filter(player => !player.ghost) || [];

  const [showVoterModal, setShowVoterModal] = useState(false);
  const [showTextChanged, setShowTextChanged] = useState('Waiting for all votes to be cast...');

  const handleVotingComplete = async () => {
    if (game) {
      await clearVotes(game.id);
      setShowVoterModal(false);
      const playerIsAlive = livingPlayers.some((player: { email: string }) => player.email === user?.email);
      if (!playerIsAlive) {
        history.push(`/game/${game.id}/votedOff`);
        return;
      }
      if (game.isEnded && !game.saboteurWins) {
        // Detectives wins
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
    if(user && game.calledMeeting == user.email) {
      if (game.votes && livingPlayers) {
        if (game.votes.length === livingPlayers.length) {
          evaluateVotes(game.id).then(result => {
            if (result) {
              updateStringField(game.id, 'kickedPlayer', result.screenName)
            }
            evaluateGameStatus(game.id)
          });
          // change the backend of allVotesCast
          toggleBooleanField(game.id, 'allVotesCast', true)
        }
      }
    }
  }, [game.votes, livingPlayers]);
  
  useEffect(() => {
    if(game.allVotesCast == true) {
      setShowTextChanged('Tallying all the votes...');

      if (game.allVotesCast) {
        const modalTimer = setTimeout(() => {
          setShowVoterModal(true);
        }, 500);
  
        const textChangeTimer = setTimeout(() => {
          setShowTextChanged('Waiting for all votes to be cast...');
          toggleBooleanField(game.id, 'allVotesCast', false)
        }, 1000);
  
        return () => {
          // change the backend of allVotesCast
          clearTimeout(modalTimer);
          clearTimeout(textChangeTimer);
        };
      }
    }
  }, [game.allVotesCast]);

  const testButton = () => {
    console.log(livingPlayers)
  }

  return (
    <IonPage>
      <IonContent>
        <div className='votingPageButtonHolder'> 
        {/* <IonButton onClick={testButton}>Test</IonButton> */}
          {/* <IonButton onClick={handleCheckVotesButton}>Test Button</IonButton> */}
          <h2 style={{color:'#301000'}}>{showTextChanged}</h2>
          <br></br>
          <h4 style={{color:'#301000'}}>Players Who have voted:</h4>

          {livingPlayers.map((player, index) => {
            const hasVoted = game.votes && Array.isArray(game.votes) && game.votes.some(vote => vote.voter === player.email);
            return (
              <div className='tallyWhoVoted' key={index}>
                {player.screenName} {hasVoted && 
                  <img src="path/to/your/checkmark.png" 
                    alt="Voted" 
                    style={{ width: '16px', height: '16px' }} 
                  />}
              </div>
            );
          })}

          {/* Scanner Modal implementation */}
          <IonModal isOpen={showVoterModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Voted Off...</IonTitle>
                <IonButton slot='end' onClick={handleVotingComplete}>Close</IonButton>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              {game.kickedPlayer} was kicked!
            </IonContent>
          </IonModal>
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

export default TallyLobby;
