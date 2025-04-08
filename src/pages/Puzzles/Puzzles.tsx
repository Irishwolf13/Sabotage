import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonModal } from '@ionic/react';
import { isRoomSabotaged, setPlayerGhostTrue } from '../../firebase/controller';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';
import './Puzzles.css';

const Puzzles: React.FC = () => {
  useGameSubscription();
  const history = useHistory();
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games[0]);

  // State to control the Ionic Modal
  const [showModal, setShowModal] = useState(false);
  const [myTitle, setMyTitle] = useState('');
  const [myBody, setMyBody] = useState('');

  const solvePuzzle = async (pass:boolean) => {
    try {
      const roomIsSabotaged = await isRoomSabotaged(game.id, game.currentRoom);
      if (roomIsSabotaged && user && user.email) {
        await setPlayerGhostTrue(game.id, user.email)
        history.push(`/game/${game.id}/deadPlayer`);
      } else {
        if (pass) {
          setMyTitle(`Congradulations!`)
          setMyBody(`You have passed this simple Task, don't you feel proud...`)
        } else {
          setMyTitle(`Better luck next time!`)
          setMyBody(`With time and effort, you'll finish this simple task.`)
        }
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error solving puzzle:', error);
    }
  };

  const toMainPage = () => {
    history.push(`/game/${game.id}/player/mainPage`);
    setShowModal(false)
  }

  // This is used to make sure all the modals are closed when being sent to dead player page
  useEffect(() => {
    if (game.foundDead) {
      if (user && user.email) { 
        // Check if the player exists and their ghost status is false
        const player = game.players.find(p => p.email === user.email);
        if (player && !player.ghost) {
          setShowModal(false);
        }
      }
    }
  }, [game]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Puzzles Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <h1>Puzzles Page</h1>
        <IonButton onClick={() => solvePuzzle(true)}>Solve Puzzle</IonButton>
        <IonButton onClick={() => solvePuzzle(false)}>Fail Puzzle</IonButton>
        {game && game.currentRoom}

        <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal-content">
            <h2>{myTitle}</h2>
            <p>{myBody}</p>
            <IonButton onClick={() => toMainPage()}>Close</IonButton>
          </div>
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

export default Puzzles;
