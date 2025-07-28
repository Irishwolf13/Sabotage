import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonList, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './VotingLobby.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
// import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import { addVote, toggleBooleanField, updateStringField } from '../../firebase/controller';
import { auth } from '../../firebase/config';
import { useAuth } from '../../firebase/AuthContext';

const VotingLobby: React.FC = () => {
  // useGameSubscription();
  const history = useHistory();
  const game = useSelector((state: RootState) => state.games[0]);
  const [email, setEmail] = useState<string | null>(null);
  const { user } = useAuth(); 
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const livingPlayers = game?.players?.filter(player => !player.ghost) || [];

    useEffect(() => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email);
      }
    }, []);

    const handleVote = async () => {
      if (!email) {
        console.log("No user email available.");
        return;
      }
      
      if (selectedPlayer) {
        try {
          console.log('gameID')
          console.log(game.id)
          // Resetting foundDead
          await toggleBooleanField(game.id, "foundDead", false);
          
          const myVote = { voter: email, selected: selectedPlayer };
          await addVote(game.id, myVote);
          
          setSelectedPlayer(null);
          
          history.push(`/game/${game.id}/tally`);
        } catch (error) {
          console.error("Error casting vote:", error);
        }
      } else {
        console.log("No player selected");
      }
    };

    // const testButton = () => {
    //   console.log(game.votes)
    // }

    const testDeadBody = async () => {
      if (user && user.email) {
        await updateStringField(game.id, 'calledMeeting', user.email)
        await toggleBooleanField(game.id, "foundDead", false);
        await toggleBooleanField(game.id, "foundDead", true);
        await toggleBooleanField(game.id, "isPlayerDead", false);
      }
    }

  return (
    <IonPage>
      <IonContent>
        <div className='votingPageButtonHolder'> 

          {/* <IonButton onClick={testButton}>test</IonButton> */}
          <h2 style={{color:'#301000'}}>Select a player to vote out:</h2>
          <div className='votingButtonHolder'>

            {livingPlayers.map(player => (
              <IonButton
              className={`blueButton ${selectedPlayer === player.email ? 'customColor' : ''}`}
              
              key={player.email}
              onClick={() => setSelectedPlayer(player.email)}
              // color={selectedPlayer === player.email ? 'danger' : undefined}
              >
                <IonLabel>{player.screenName}</IonLabel>
              </IonButton>
            ))}

          </div>
          <IonButton className='castVoteButton' expand="block" onClick={handleVote} disabled={!selectedPlayer} >
            Cast Vote
          </IonButton>
        <IonButton onClick={testDeadBody}>Test Dead Body</IonButton>
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
