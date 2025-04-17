import React, { useEffect, useState } from 'react';
import { IonButton, IonInput } from '@ionic/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AppDispatch } from '../../stores/store';
import { auth } from '../../firebase/config';
import { joinGame, getPlayerNameByEmail } from '../../firebase/controller';
import { setGames } from '../../stores/gameSlice';

const JoinGameButton: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
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
        const playerName = await getPlayerNameByEmail(email);

        const result = await joinGame(gameCode, email);

        if (result) {
          console.log(result); // Log the result for debug purposes

          // Navigate to the game page
          history.push(`/game/${result}/join`);

          // Update the game state in Redux
          dispatch(setGames([{
            id: result,
            name: result,
            code: gameCode,
            isEnded: false,
            isStarted: false,
            foundDead: false,
            saboteurWins: false, 
            currentRoom: -3, 
            calledMeeting: '', 
            allVotesCast: false, 
            kickedPlayer: '',
            votes: [],
            players: [{
              screenName: playerName,
              email: email,
              ghost: false,
              isSaboteur: false
            }],
          }]));

        } else {
          alert('Failed to join the game. Please check the game code.');
        }
      } catch (error) {
        console.error("An error occurred:", error); // Log unexpected errors
        alert('An unexpected error occurred.');
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
        onIonInput={(e) => setGameCode(e.detail.value!.toUpperCase())} // Convert input to uppercase
        maxlength={5}
      />
      <IonButton onClick={handleJoinGame}>Join Game</IonButton>
    </div>
  );
};

export default JoinGameButton;
