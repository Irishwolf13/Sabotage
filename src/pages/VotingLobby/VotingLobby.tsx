import React, { useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonList, IonRadioGroup, IonItem, IonLabel, IonRadio } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './VotingLobby.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';

const VotingLobby: React.FC = () => {
  useGameSubscription();
  const history = useHistory();
  const game = useSelector((state: RootState) => state.games[0]);
  // console.log(game);

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const handleVote = () => {
    if (selectedPlayer) {
        console.log(`Voted for player: ${selectedPlayer}`);
        if (game.isSaboteur) {
          setSelectedPlayer('')
          history.push(`/game/${game.id}/player/l`);
        } else {
          setSelectedPlayer('')
          history.push(`/game/${game.id}/player/1`);
        }
    } else {
        console.log("No player selected");
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
        <IonList>
          <IonRadioGroup value={selectedPlayer} onIonChange={(e) => setSelectedPlayer(e.detail.value)}>
            {game?.players && game.players.map((player, index) => (
              <IonItem key={index} button onClick={() => setSelectedPlayer(player)}>
                <IonLabel>{player}</IonLabel>
                <IonRadio slot="start" value={player} />
              </IonItem>
            ))}
          </IonRadioGroup>
        </IonList>
        <IonButton onClick={handleVote}>Cast Vote</IonButton>
        {/* <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} /> */}
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
