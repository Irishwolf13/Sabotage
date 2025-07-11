import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonModal, IonButtons } from '@ionic/react';
import { isRoomSabotaged, setPlayerGhostTrue, setRoomSabotageFalse, updateRoomStatus } from '../../../firebase/controller';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../../stores/store';
import FoundBodyModal from '../../../components/Modals/FoundBodyModal';
import '../Puzzles.css';

const Puzzle3: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const game = useSelector((state: RootState) => state.games[0]);
  const history = useHistory();
  const { user } = useAuth();

  const colors = [
    'red', 'blue', 'green', 'yellow', 'orange',
    'purple', 'pink'
  ];

  const [myTitle, setMyTitle] = useState('');
  const [myBody, setMyBody] = useState('');
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [collectedCircles, setCollectedCircles] = useState<string[]>([]);

  const generateRandomColorSequence = (length: number) =>
    Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)]);

  // Helper to count occurrences of each color
  const getColorCounts = (sequence: string[]) => {
    return sequence.reduce<Record<string, number>>((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});
  };

  const solvePuzzle = async (pass: boolean) => {
    if (!user) return; // Early exit if user is not defined
  
    try {
      const currentPlayer = game.players.find(
        (player: { email: string; isSaboteur: boolean }) => player.email === user.email
      );
  
      // Check if the room is sabotaged
      const roomIsSabotaged = await isRoomSabotaged(game.id, game.currentRoom);
  
      if (roomIsSabotaged && currentPlayer && !currentPlayer.isSaboteur && user.email) {
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
        setCollectedCircles([]);
        setTargetSequence(generateRandomColorSequence(5));
      }
    } catch (error) {
      console.error('Error solving puzzle:', error);
    }
  };

  const toMainPage = () => {
    history.push(`/game/${game.id}/player/mainPage`);
    setShowModal(false);
  };

  useEffect(() => {
    setTargetSequence(generateRandomColorSequence(5));
  }, []);
  
  // These next two useEffects could be combined, but for now, I'm going to keep the seperate
  // Reset circles if the elements don't match the target sequence
  useEffect(() => {
    const isMatching = collectedCircles.every((color, index) => color === targetSequence[index]);

    if (!isMatching && collectedCircles.length > 0) {
      setCollectedCircles([]); 
    }
  }, [collectedCircles, targetSequence]);

  // The final check for passing the puzzle
  useEffect(() => {
    if ( collectedCircles.length === targetSequence.length && collectedCircles.length > 0) {
      const targetCounts = getColorCounts(targetSequence);
      const collectedCounts = getColorCounts(collectedCircles);
      const pass = Object.keys(targetCounts).every(
        color => collectedCounts[color] === targetCounts[color]
      );

      solvePuzzle(pass);
    }
  }, [collectedCircles, targetSequence]);

  const handleCircleClick = (color: string, event: any) => {
    setCollectedCircles((prev) => [...prev, color]);

    const clickedCircle = event.target as HTMLDivElement;
    if (clickedCircle && clickedCircle.parentNode) {
      clickedCircle.parentNode.removeChild(clickedCircle);
    }
  };
  
  const throwCircles = () => {
    const container = document.querySelector('.circle-container');
    if (!container) return;

    const circle = document.createElement('div');
    const minSize = 60;
    const maxSize = 130;
    const size = Math.random() * (maxSize - minSize) + minSize;

    // Random speed not depending on size
    const minSpeed = 2000; // Minimum duration in milliseconds
    const maxSpeed = 7000; // Maximum duration in milliseconds
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

    const color = colors[Math.floor(Math.random() * colors.length)];

    circle.className = 'circle';
    circle.style.backgroundColor = color;
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;

    const startTop = Math.random() * (container.clientHeight - size);
    const endTop = Math.random() * (container.clientHeight - size);

    circle.style.top = `${startTop}px`;
    circle.style.left = `100vw`;

    container.appendChild(circle);

    setTimeout(() => {
      circle.style.transition = `transform ${speed}ms linear`;
      circle.style.transform = `translateX(-150vw) translateY(${endTop - startTop}px)`;

      const extraTimeBuffer = 1000;

      setTimeout(() => {
        if (circle.parentElement) {
          circle.parentElement.removeChild(circle);
        }
      }, speed + extraTimeBuffer);
    }, 100);

    circle.onclick = (e) => handleCircleClick(color, e);

    setTimeout(throwCircles, Math.random() * 500 + 500);
  };

  useEffect(() => {
    throwCircles();
  }, []);

  return (
    <IonPage>
      {/* <IonHeader>
        <IonToolbar>
          <IonTitle>Puzzle 3</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => solvePuzzle(false)}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader> */}
      <div className='puzzlePageButtonHolder'>
        <IonButton className='blueButton' onClick={() => solvePuzzle(false)}>Cancel</IonButton>
      </div>
      <IonContent>
      <div className='puzzle3Main'>
        <div>
          <h4 className='centeredText'>Collection Order</h4>
          <div className="target-sequence">
            {targetSequence.map((color, index) => (
              <div key={index} className="target-circle" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        <div className="circle-container" />

        <div className="collected-circles">
          {collectedCircles.map((color, index) => (
            <div key={index} className="collected-circle" style={{ backgroundColor: color }} />
          ))}
        </div>

        <div className='hintText'>
            <span>Touch a circle to collect color</span>
            <br></br>
            <span>Collect colors in collection order</span>
          </div>

        <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
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

export default Puzzle3;
