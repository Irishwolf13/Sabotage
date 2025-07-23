import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonModal, useIonViewWillEnter } from '@ionic/react';
import { isRoomSabotaged, setPlayerGhostTrue, setRoomSabotageFalse, updateRoomStatus } from '../../../firebase/controller';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../../stores/store';
import FoundBodyModal from '../../../components/Modals/FoundBodyModal';
import '../Puzzles.css';

import Puzzle1 from '../Puzzle1/Puzzle1';
import Puzzle2 from '../Puzzle2/Puzzle2';
import Puzzle3 from '../Puzzle3/Puzzle3';
import Puzzle4 from '../Puzzle4/Puzzle4';
import LoadingSpinner from '../../../components/LoadingSpinner';

const PuzzlePage: React.FC = () => {
  const game = useSelector((state: RootState) => state.games[0]);
  const history = useHistory();
  const { user } = useAuth();
  
  const [myTitle, setMyTitle] = useState('');
  const [myBody, setMyBody] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Loading screen stuff
  const [showLoading, setShowLoading] = useState(true);
  useIonViewWillEnter(() => {
    setShowLoading(true)
    const timeout = setTimeout(() => setShowLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  const toMainPage = () => {
    history.push(`/game/${game.id}/player/mainPage`);
    setShowModal(false);
  };

  const solvePuzzle = async (pass: boolean) => {
    if (!user) return;
    try {
      const currentPlayer = game.players.find( (player: { email: string; isSaboteur: boolean }) => player.email === user.email );
      const roomIsSabotaged = await isRoomSabotaged(game.id, game.currentRoom);

      if (roomIsSabotaged && currentPlayer && user.email && !currentPlayer.isSaboteur) {
        await setPlayerGhostTrue(game.id, user.email);
        await setRoomSabotageFalse(game.id, game.currentRoom);
        history.push(`/game/${game.id}/deadPlayer`);
      } else {
        if (pass) {
          if (user && user.email) {
            updateRoomStatus(game.id, user.email, game.currentRoom);
            setMyTitle('Congratulations!');
            setMyBody("You have passed this simple Task, don't you feel proud...");
          }
        } else {
          setMyTitle('Better luck next time!');
          setMyBody("With time and effort, you'll finish this simple task.");
        }
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error solving puzzle:', error);
    }
  };

  const handleTest = () => {
    console.log(game)
  }
  return (
    <IonPage>
      <IonContent>
        {showLoading && ( <LoadingSpinner /> )}
        <button onClick={handleTest}>Test Check</button>
        <div className='puzzlePageButtonHolder'>
          <IonButton className='blueButton' onClick={() => solvePuzzle(false)}>Cancel</IonButton>
        </div>

        <div className='PuzzlePageMain'>
          <Puzzle4 solvePuzzle={solvePuzzle} />

          {/* MODALS */}
          <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
          <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
            <div className="modal-content">
              <h2>{myTitle}</h2>
              <p>{myBody}</p>
              <IonButton className='blueButton' onClick={toMainPage}>Close</IonButton>
            </div>
          </IonModal>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default PuzzlePage;
