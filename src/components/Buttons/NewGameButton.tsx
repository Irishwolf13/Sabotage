import React, { useEffect, useState } from 'react';
import { IonButton } from '@ionic/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { addGame, removeGame } from '../../stores/gameSlice'; 
import { AppDispatch } from '../../stores/store';
import { createGameDocument, getPlayerNameByEmail } from '../../firebase/controller';
import { auth } from '../../firebase/config';
import './buttons.css';

// Function to generate a random 5-letter code
const generateRandomCode = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

const NewGameButton: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory(); 
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Access current user's email from Firebase Auth if available
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleNewGame = async () => {
    if (!email) {
      console.error("User email is not available");
      return;
    }

    try {
      // Clear existing games
      dispatch(removeGame());

      const myPlayerName = await getPlayerNameByEmail(email);
      const newUUID = uuidv4();
      const randomCode = generateRandomCode(5);

      // First create the Firestore document
      await createGameDocument(newUUID, newUUID, randomCode, email, myPlayerName);

      // Construct and dispatch new game data
      const newGame = {
        id: newUUID,
        name: `${newUUID}`,
        code: randomCode,
        isEnded: false,
        isStarted: false,
        gameRound: 0,
        foundDead: false,
        isVoting: false,
        isPlayerDead: false,
        isAlarmActive: false,
        saboteurWins: false, 
        currentRoom: -2,
        calledMeeting: '',
        allVotesCast: false,
        kickedPlayer: '',
        players: [{
          screenName: myPlayerName,
          email: email,
          ghost: false,
          isSaboteur: false,
          votes: [],
        }],
      };

      dispatch(addGame(newGame));
      history.push(`/game/${newUUID}`);

    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  return (
    <div>
      <IonButton className='yellowButton' onClick={handleNewGame}>Create Game</IonButton>
    </div>
  );
};

export default NewGameButton;
