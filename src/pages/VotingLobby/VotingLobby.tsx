import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonList, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './VotingLobby.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import { addVote, toggleBooleanField } from '../../firebase/controller';
import { auth } from '../../firebase/config';

const VotingLobby: React.FC = () => {
  useGameSubscription();
  const history = useHistory();
  const game = useSelector((state: RootState) => state.games[0]);
  const [email, setEmail] = useState<string | null>(null);
  
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

    const testButton = () => {
      console.log(game.votes)
    }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Voting Lobby</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonButton onClick={testButton}>test</IonButton>
        <h2>Select a player to vote out:</h2>
        <IonList>
          {livingPlayers.map(player => (
            <IonItem
              key={player.email}
              button
              onClick={() => setSelectedPlayer(player.email)}
              color={selectedPlayer === player.email ? 'danger' : undefined}
            >
              <IonLabel>{player.screenName}</IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonButton
          expand="block"
          onClick={handleVote}
          disabled={!selectedPlayer}
        >
          Cast Vote
        </IonButton>
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
