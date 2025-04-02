import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory from react-router-dom
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonButton, IonList, IonItem } from '@ionic/react';
import './CreatorLobby.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import { setGames } from '../../stores/gameSlice';
import { assignPlayersToRooms } from '../../components/roomAssignment';
import { auth } from '../../firebase/config';
import StartGameModal from '../../components/Modals/StartGameModal';
import { useRoleId } from '../../components/useRoleId';
import { listenForGameChanges, toggleBooleanField, updatePlayerRoles, getInnocentBaseColors, addRoomColors } from '../../firebase/controller';

const CreatorLobby: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const game = useSelector((state: RootState) => state.games[0]);
  const [numSlots, setnumSlots] = useState(8);
  const [numRooms, setnumRooms] = useState(5);
  const testNumberOfInnocents = 7;
  const [numSaboteurs, setNumSaboteurs] = useState(1);
  const [email, setEmail] = useState<string | null>(null);
  const games = useSelector((state: RootState) => state.games);
  const currentGame = games.length > 0 ? games[0] : undefined;

  // Use the custom hook to manage roleId and players list
  const { roleId, players } = useRoleId(currentGame?.id, email);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
      // console.log(`User email: ${user.email}`);
    }
  }, []);

  useEffect(() => {
    if (game?.id) {
      const unsubscribe = listenForGameChanges(game.id, (data) => {
        dispatch(
          setGames([
            {
              id: game.id,
              name: data.gameName,
              code: data.gameCode,
              players: data.players,
              isEnded: data.isEnded,
              isStarted: data.isStarted,
              foundDead: data.foundDead,
              color: '',
            },
          ])
        );
      });
      return () => unsubscribe();
    }
  }, [dispatch, game?.id]);

  if (!game) {
    return <p>No game available</p>;
  }

  const handleToggleStatus = async (key: any, value: any) => {
    await toggleBooleanField(game.id, key, value);
  };

  const handleStartGame = async (numSaboteurs: number) => {
    if (game.players && game.players.length > 0) {
      const totalPlayers = game.players.length;
      const availableColors = await getInnocentBaseColors();
    
      // testNumberOfInnocents will need to be replaced by totalPlayers at some point
      const rooms = assignPlayersToRooms(numRooms, totalPlayers, availableColors);
      console.log('rooms')
      console.log(rooms)
      console.log(game.id)
      addRoomColors(game.id, rooms)

      // Selects all the colors used, to assign to players later...
      const colorsSet = new Set<string>();
      rooms.forEach(room => {
        room.forEach(playerAssignment => {
          colorsSet.add(playerAssignment.color);
        });
      });
  
      const uniqueColors = Array.from(colorsSet);
  
      if (numSaboteurs >= totalPlayers) {
        console.error("Number of saboteurs cannot be equal to or exceed total players.");
        return;
      }
  
      // Shuffle players to ensure randomness
      const shuffledPlayers = [...game.players].sort(() => Math.random() - 0.5);
  
      // Randomly select saboteurs
      const selectedSaboteurs: Set<number> = new Set();
      while (selectedSaboteurs.size < numSaboteurs) {
        const saboteurIndex = Math.floor(Math.random() * totalPlayers);
        selectedSaboteurs.add(saboteurIndex);
      }
  
      const innocentPlayers: { email: string, color: string }[] = [];
      const saboteurPlayers: { email: string, color: string }[] = [];
  
      shuffledPlayers.forEach((player, index) => {
        if (selectedSaboteurs.has(index)) {
          // Assign a white color for saboteurs
          saboteurPlayers.push({ email: player, color: "(255,255,255)" });
        } else {
          if (uniqueColors.length === 0) {
            console.error("Not enough unique colors for all innocent players.");
            return;
          }
          
          const colorIndex = Math.floor(Math.random() * uniqueColors.length);
          const color = uniqueColors.splice(colorIndex, 1)[0]; // Remove color from the pool
          innocentPlayers.push({ email: player, color });
        }
      });
  
      // Update roles in Firestore
      await updatePlayerRoles(game.id, saboteurPlayers, innocentPlayers);
  
      // Toggle the game's "isStarted" status
      await handleToggleStatus('isStarted', game.isStarted);
    } else {
      console.log('No players available for role assignment.');
    }
  };
  
  

  const decreaseNumSlots = () => {
    setnumSlots(prev => Math.max(prev - 1, game.players.length));
  };

  const increaseNumSlots = () => {
    setnumSlots(prev => Math.min(prev + 1, 16));
  };

  const decreaseNumRooms = () => {
    setnumRooms(prev => Math.max(prev - 1, 1));
  };

  const increaseNumRooms = () => {
    setnumRooms(prev => Math.min(prev + 1, 16));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setNumSaboteurs(isNaN(value) ? 1 : value);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{email || "User"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <h1>
          Join Code: <strong>{game.code}</strong>
        </h1>
        <h3>{game.isStarted ? 'Get Ready!' : 'In Lobby'}</h3>
        <IonButton onClick={decreaseNumSlots}>Slot -</IonButton>
        <IonButton onClick={increaseNumSlots}>Slot +</IonButton>
        {numSlots}
        <IonButton onClick={decreaseNumRooms}>Room -</IonButton>
        <IonButton onClick={increaseNumRooms}>Room +</IonButton>
        {numRooms}
        <IonList>
          {Array.from({ length: numSlots }).map((_, index) => (
            <IonItem key={index}>
              {game.players && game.players[index] ? game.players[index] : "Open Slot"}
            </IonItem>
          ))}
        </IonList>
        <div>
          <label htmlFor="saboteurs">Number of Saboteurs:</label>
          <input
            id="saboteurs"
            type="number"
            min="1"
            max="10" // Adjust max based on your game constraints
            value={numSaboteurs}
            onChange={handleChange}
          />
        </div>
        <IonButton onClick={() => handleStartGame(numSaboteurs)}>Start Game!</IonButton>
        <StartGameModal isStarted={!!game?.isStarted} currentGameId={game?.id} roleId={roleId} />
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle size="small">© 2025 Dancing Goat Studios</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default CreatorLobby;
