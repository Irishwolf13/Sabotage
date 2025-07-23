import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonModal, IonButtons } from '@ionic/react';
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

interface ContainerProps {
  myNumber: number;
}

const PuzzlePage: React.FC<ContainerProps> = ({ myNumber }) => {
  const [showModal, setShowModal] = useState(false);
  const game = useSelector((state: RootState) => state.games[0]);
  const history = useHistory();
  const { user } = useAuth();

  const [myTitle, setMyTitle] = useState('');
  const [myBody, setMyBody] = useState('');

  const solvePuzzle = async (pass: boolean) => {
    if (!user) return; // Early exit if user is not defined
  
    try {
      const currentPlayer = game.players.find(
        (player: { email: string; isSaboteur: boolean }) => player.email === user.email
      );
  
      // Check if the room is sabotaged
      const roomIsSabotaged = await isRoomSabotaged(game.id, game.currentRoom);
  
      if (roomIsSabotaged && currentPlayer && user.email && !currentPlayer.isSaboteur ) {
        // Handle if the room is sabotaged and the current player is not the saboteur
        await setPlayerGhostTrue(game.id, user.email);
        await setRoomSabotageFalse(game.id, game.currentRoom)
        history.push(`/game/${game.id}/deadPlayer`);
      } else {
        // Set appropriate title and body based on pass condition
        if (pass) {
          if (user && user.email) {
            updateRoomStatus(game.id, user.email, game.currentRoom)
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

  const toMainPage = () => {
    history.push(`/game/${game.id}/player/mainPage`);
    setShowModal(false);
  };

  return (
    <IonPage>
      <div className='puzzlePageButtonHolder'>
        <IonButton className='blueButton' onClick={() => solvePuzzle(false)}>Cancel</IonButton>
      </div>
      <IonContent>
      <div className='PuzzlePageMain'>
        
        {/* Puzzles here */}
        {/* {< Puzzle1 solvePuzzle={solvePuzzle}/>} */}
        {/* {< Puzzle2 solvePuzzle={solvePuzzle}/>} */}
        {/* {< Puzzle3 solvePuzzle={solvePuzzle}/>} */}
        {< Puzzle4 solvePuzzle={solvePuzzle}/>}

        {/* Modal if body is found while playing the game */}
        <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
        
        {/* Modal on Solve */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal-content">
            <h2>{myTitle}</h2>
            <p>{myBody}</p>
            <IonButton className='blueButton' onClick={() => toMainPage()}>Close</IonButton>
          </div>
        </IonModal>
      
      </div>
      </IonContent>
    </IonPage>
  );
};

export default PuzzlePage;
