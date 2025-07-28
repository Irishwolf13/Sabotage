import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, IonModal, useIonViewWillEnter } from '@ionic/react';
import { isRoomSabotaged, setPlayerGhostTrue, setRoomSabotageFalse, updateRoomStatus } from '../../../firebase/controller';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../../stores/store';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Puzzle1 from '../Puzzle1/Puzzle1';
import Puzzle2 from '../Puzzle2/Puzzle2';
import Puzzle3 from '../Puzzle3/Puzzle3';
import Puzzle4 from '../Puzzle4/Puzzle4';
import Puzzle5 from '../Puzzle5/Puzzle5';
import Puzzle6 from '../Puzzle6/Puzzle6';

const PuzzlePage: React.FC = () => {
  const game = useSelector((state: RootState) => state.games[0]);
  const history = useHistory();
  const { user } = useAuth();

  const [myTitle, setMyTitle] = useState('');
  const [myBody, setMyBody] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const numberOfPuzzles = 6

  // New state to handle the current puzzle
  const [currentPuzzleNumber, setCurrentPuzzleNumber] = useState<number | null>(null);

  useIonViewWillEnter(() => {
    setShowLoading(true);
    const timeout = setTimeout(() => setShowLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const findCurrentPuzzleNumber = () => {
      if (!user) return null;
      const currentPlayer = game.players.find(player => player.email === user.email);
      if (!currentPlayer || !Array.isArray(currentPlayer.rooms)) return null;

      if (currentPlayer.isSaboteur) {
        // return Math.floor(Math.random() * numberOfPuzzles) + 1;
        return 6
      } else {
        const unsolvedRoom = currentPlayer.rooms.find(room => !room.solved);
        return unsolvedRoom ? unsolvedRoom.puzzleNumber : null;
      }
    };

    setCurrentPuzzleNumber(findCurrentPuzzleNumber());
  }, [game, user]);

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

  return (
    <IonPage>
      <IonContent>
        {showLoading && <LoadingSpinner />}
        <div className='puzzlePageButtonHolder'>
          <IonButton className='blueButton' onClick={() => solvePuzzle(false)}>Cancel</IonButton>
        </div>

        <div className='PuzzlePageMain'>
          {currentPuzzleNumber === 1 && <Puzzle1 solvePuzzle={solvePuzzle} />}
          {currentPuzzleNumber === 2 && <Puzzle2 solvePuzzle={solvePuzzle} />}
          {currentPuzzleNumber === 3 && <Puzzle3 solvePuzzle={solvePuzzle} />}
          {currentPuzzleNumber === 4 && <Puzzle4 solvePuzzle={solvePuzzle} />}
          {currentPuzzleNumber === 5 && <Puzzle5 solvePuzzle={solvePuzzle} />}
          {currentPuzzleNumber === 6 && <Puzzle6 solvePuzzle={solvePuzzle} />}
          {!currentPuzzleNumber && <p>No puzzles available!</p>}

          {/* MODALS */}
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
