import React from 'react';
import { IonButton, IonList, IonItem, IonLabel } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom'; // Import useHistory
import { v4 as uuidv4 } from 'uuid';
import { addGame } from '../stores/gameSlice'; 
import { AppDispatch, RootState } from '../stores/store';

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
  const history = useHistory(); // Initialize useHistory
  const games = useSelector((state: RootState) => state.games);

  const handleNewGame = () => {
    const newUUID = uuidv4();
    const randomCode = generateRandomCode(5);
    const newGame = {
      id: newUUID,
      name: `${newUUID}`,
      code: randomCode,
    };
    dispatch(addGame(newGame));

    // Push to the new route with newUUID
    history.push(`/game/${newUUID}`);
  };

  return (
    <div>
      <IonButton onClick={handleNewGame}>Create Game</IonButton>
      {/* <IonList>
        {games.map(game => (
          <IonItem key={game.id}>
            <IonLabel>{game.name} - Code: {game.code}</IonLabel>
          </IonItem>
        ))}
      </IonList> */}
    </div>
  );
};

export default NewGameButton;
