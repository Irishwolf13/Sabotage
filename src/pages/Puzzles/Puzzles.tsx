import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonModal,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Puzzles.css';
import { useAuth } from '../../firebase/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';
import { isRoomSabotaged } from '../../firebase/controller';

const Puzzles: React.FC = () => {
  useGameSubscription();
  const history = useHistory();
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games[0]);

  // State to control the Ionic Modal
  const [showModal, setShowModal] = useState(false);

  const solvePuzzle = async () => {
    try {
      const roomIsSabotaged = await isRoomSabotaged(game.id, game.currentRoom);
      if (roomIsSabotaged) {
        // Navigate to dead player page if room is sabotaged
        history.push(`/game/${game.id}/deadPlayer`);
      } else {
        // Open the modal when the puzzle is solved
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

  const failPuzzle = () => {
    console.log('you failed');
  };

  const testButton = () => {
    console.log(game.currentRoom);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Puzzles Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <h1>Puzzles Page</h1>
        <IonButton onClick={testButton}>Test Button</IonButton>
        <IonButton onClick={solvePuzzle}>Solve Puzzle</IonButton>
        <IonButton onClick={failPuzzle}>Fail Puzzle</IonButton>
        <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
        {game && game.currentRoom}
        
        {/* Ionic Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal-content">
            <h2>Congratulations!</h2>
            <p>You have successfully solved the puzzle.</p>
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
