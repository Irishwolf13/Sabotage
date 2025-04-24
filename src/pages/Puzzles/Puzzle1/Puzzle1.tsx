import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonModal, IonButtons } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../../stores/store';
import { isRoomSabotaged, setPlayerGhostTrue, setRoomSabotageFalse, updateRoomStatus } from '../../../firebase/controller';
import FoundBodyModal from '../../../components/Modals/FoundBodyModal';
import '../Puzzles.css'

const Puzzle1: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [placedColors, setPlacedColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [shuffledCircles, setShuffledCircles] = useState<string[]>([]);
  const [shuffledBoxes, setShuffledBoxes] = useState<string[]>([]);
  const history = useHistory();
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games[0]);

  const [myTitle, setMyTitle] = useState('');
  const [myBody, setMyBody] = useState('');

  const solvePuzzle = async (pass: boolean) => {
    console.log('currentGame Here:')
    console.log(game)
    if (!user) return; // Early exit if user is not defined
  
    try {
      const currentPlayer = game.players.find(
        (player: { email: string; isSaboteur: boolean }) => player.email === user.email
      );
      // Await the result of checking if the room is sabotaged
      const roomIsSabotaged = await isRoomSabotaged(game.id, game.currentRoom);

      if (roomIsSabotaged && currentPlayer && !currentPlayer.isSaboteur && user && user.email) {
        // Handle scenario where the room is sabotaged and current player is not a saboteur
        await setPlayerGhostTrue(game.id, user.email);
        await setRoomSabotageFalse(game.id, game.currentRoom)
        history.push(`/game/${game.id}/deadPlayer`);
      } else {
        // Set appropriate title and body based on pass condition
        if (pass) {
          if (user && user.email) {
            updateRoomStatus(game.id, user.email, game.currentRoom)
          }
          setMyTitle('Congratulations!');
          setMyBody("You have passed this simple Task, don't you feel proud...");
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

  // Colors array with initial values
  const colors = ['red', 'blue', 'green', 'yellow'];

  // Function to shuffle an array
  const shuffleArray = (array: string[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // Reset game state including shuffles
  const resetGameState = () => {
    setPlacedColors([]);
    setSelectedColor(null);
    setShuffledCircles(shuffleArray([...colors]));
    setShuffledBoxes(shuffleArray([...colors]));
  };

  // Shuffle once when the component mounts or remounts
  useEffect(() => {
    resetGameState();  // Reset placed colors, selected color, and shuffled elements
  }, []);  // Empty dependency array ensures this runs only on mount/unmount

  // Reset game state whenever the modal is closed.
  useEffect(() => {
    if (!showModal) {
      resetGameState();
    }
  }, [showModal]); // Depend on showModal to reset when it's closed

  // Handle modals for player ghost status
  useEffect(() => {
    if (game.foundDead && user?.email) {
      const player = game.players.find((p) => p.email === user.email);
      if (player && !player.ghost) {
        setShowModal(false);
      }
    }
  }, [game, user]);

  const handleCircleClick = (color: string) => {
    if (!placedColors.includes(color)) {
      setSelectedColor(selectedColor === color ? null : color);
    }
  };

  const handleBoxClick = (boxColor: string) => {
    if (selectedColor) {
      if (selectedColor === boxColor && !placedColors.includes(selectedColor)) {
        // Correct placement
        setPlacedColors([...placedColors, selectedColor]);
        if (placedColors.length + 1 === colors.length) {
          solvePuzzle(true);
        }
      }
      // Reset the selected color regardless of whether the placement was correct or not
      setSelectedColor(null);
    }
  };

  const cancleTry = () => {
    solvePuzzle(false);
    setSelectedColor(null);
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
      {/* <IonHeader>
        <IonToolbar>
          <IonTitle>Puzzle 1</IonTitle>
          <IonButtons slot='end'>
          </IonButtons>
          </IonToolbar>
          </IonHeader> */}
          <div className='puzzlePageButtonHolder'>
            <IonButton className='blueButton' onClick={cancleTry}>Cancel</IonButton>
          </div>
      <IonContent>
        <div className='puzzle1Main'>
          <div className='puzzle1'>

            <div className='puzzle1Circles'>
              {shuffledCircles.map((color) => (
                <div
                  key={color}
                  onClick={() => handleCircleClick(color)}
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: selectedColor === color || placedColors.includes(color) ? 'transparent' : color,
                    border: `2px solid ${color}`,
                    borderRadius: '50%',
                    margin: 10,
                    cursor: 'pointer',
                    opacity: placedColors.includes(color) ? 0.5 : 1,
                  }}
                />
              ))}
            </div>
            <div>
              {shuffledBoxes.map((color) => (
                <div
                  key={color}
                  onClick={() => handleBoxClick(color)}
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: placedColors.includes(color) ? color : 'transparent',
                    border: `2px solid ${color}`,
                    margin: 10,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
          <div className='hintText'>
            <span>Touch a circle to pick up color</span>
            <br></br>
            <span>Touch a square to drop the color</span>
            <br></br>
            <span>Drop all colors into matching squares</span>
          </div>
        </div>
        <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal-content">
            <h2>{myTitle}</h2>
            <p>{myBody}</p>
            <IonButton onClick={() => toMainPage()}>Close</IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Puzzle1;