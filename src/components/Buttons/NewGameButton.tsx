import React, { useEffect, useState } from 'react';
import { IonButton } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { addGame } from '../../stores/gameSlice'; 
import { AppDispatch, RootState } from '../../stores/store';
import { createGameDocument } from '../../firebase/controller';
import { auth } from '../../firebase/config';

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
  const games = useSelector((state: RootState) => state.games);
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

    const newUUID = uuidv4();
    const randomCode = generateRandomCode(5);
    const newGame = {
      id: newUUID,
      name: `${newUUID}`,
      code: randomCode,
      isEnded: false,
      isStarted: false,
      foundDead: false,
      players: [{screenName: 'Frank', email: email, color:'', ghost: false, isSaboteur: false}],
    }

    // Dispatch the new game to the Redux store
    dispatch(addGame(newGame));

    // Use the imported function to create the game document in Firestore
    await createGameDocument(newUUID, newGame.name, randomCode, email, 'Frank');

    // Redirect to the new route with newUUID
    history.push(`/game/${newUUID}`);
  };

  return (
    <div>
      <IonButton onClick={handleNewGame}>Create Game</IonButton>
    </div>
  );
};

export default NewGameButton;
