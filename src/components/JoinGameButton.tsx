import React, { useEffect, useState } from 'react';
import { IonButton, IonInput } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AppDispatch, RootState } from '../stores/store';
import { auth } from '../firebase/config';
import { joinGame } from '../firebase/controller'; // Adjust the import path accordingly

const NewGameButton: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const games = useSelector((state: RootState) => state.games);
  const [email, setEmail] = useState<string | null>(null);
  const [gameCode, setGameCode] = useState<string>('');

  useEffect(() => {
    // Access current user's email from Firebase Auth if available
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleJoinGame = async () => {
    if (!email) {
      alert('Please log in to join a game.');
      return;
    }

    if (gameCode.length === 5) {
      try {
        await joinGame(gameCode, email);
      } catch (error) {
        // alert(error.message);
      }
    } else {
      alert('Please enter a 5-letter game code.');
    }
  };

  return (
    <div>
      <IonInput
        value={gameCode}
        placeholder="Enter 5-letter code"
        onIonInput={(e) => setGameCode(e.detail.value!)}
        maxlength={5}
      />
      <IonButton onClick={handleJoinGame}>Join Game</IonButton>
    </div>
  );
};

export default NewGameButton;
