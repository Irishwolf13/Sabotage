import React, { useState } from 'react';
import { IonButton, IonContent, IonPage, IonTitle, IonToolbar, IonFooter, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { addVote, toggleBooleanField } from '../../firebase/controller';
import { useAuth } from '../../firebase/AuthContext';
import './VotingLobby.css';

const VotingLobby: React.FC = () => {
  const history = useHistory();
  const game = useSelector((state: RootState) => state.games[0]);
  const { user } = useAuth(); 
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const livingPlayers = game?.players?.filter(player => !player.ghost) || [];

  const handleVote = async () => {
    if (!user || !user.email || !selectedPlayer) { console.log("Voting error: missing user or selectedPlayer");  return;}

    try {
      // Reset foundDead
      await toggleBooleanField(game.id, "foundDead", false);
      await toggleBooleanField(game.id, 'isVoting', true);

      // Add vote
      const myVote = { voter: user.email, selected: selectedPlayer, gameRound: game.gameRound };
      await addVote(game.id, myVote);
      
      // Go to Tally Page
      setSelectedPlayer(null);
      history.push(`/game/${game.id}/tally`);

    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className='votingPageButtonHolder'> 
          <h2 style={{color:'#301000'}}>Select a player to vote out:</h2>
          <div className='votingButtonHolder'>
            {livingPlayers.map(player => (
              <IonButton
                className={`blueButton ${selectedPlayer === player.email ? 'customColor' : ''}`}
                key={player.email}
                onClick={() => setSelectedPlayer(player.email)}
              >
                <IonLabel>{player.screenName}</IonLabel>
              </IonButton>
            ))}
          </div>

          <IonButton className='castVoteButton' expand="block" onClick={handleVote} >Cast Vote</IonButton>
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

export default VotingLobby;
