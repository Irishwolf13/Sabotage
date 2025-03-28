import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory from react-router-dom
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonButton, IonList, IonItem } from '@ionic/react';
import './CreatorLobby.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges, toggleBooleanField, updatePlayerRoles } from '../../firebase/controller';
import { setGames } from '../../stores/gameSlice';
import { assignPlayersToRooms } from '../../components/roomAssignment';
import { auth } from '../../firebase/config';
import StartGameModal from '../../components/StartGameModal';
import { useRoleId } from '../../components/useRoleId';

const CreatorLobby: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory(); // Initialize useHistory

  const game = useSelector((state: RootState) => state.games[0]);
  const [numSlots, setnumSlots] = useState(8);
  const [numRooms, setnumRooms] = useState(7);
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
              isDead: data.isDead,
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
    // Assign players to rooms
    // const rooms = assignPlayersToRooms(numRooms, numSlots - 1);
    // rooms.forEach((room, index) => {
    //   console.log(`Room ${index + 1}: Players ${room.map(p => p + 1).join(', ')}`);
    // });

    // Assign roles to players
    if (game.players && game.players.length > 0) {
      const totalPlayers = game.players.length;

      if (numSaboteurs >= totalPlayers) {
        console.error("Number of saboteurs cannot be equal to or exceed total players.");
        return;
      }

      const selectedSaboteurs: Set<number> = new Set();

      // Randomly select saboteurs
      while (selectedSaboteurs.size < numSaboteurs) {
        const saboteurIndex = Math.floor(Math.random() * totalPlayers);
        selectedSaboteurs.add(saboteurIndex);
      }

      const innocentPlayers: string[] = [];
      const saboteurPlayers: string[] = [];

      game.players.forEach((player, index) => {
        if (selectedSaboteurs.has(index)) {
          saboteurPlayers.push(player);
        } else {
          innocentPlayers.push(player);
        }
      });

      // console.log('Saboteurs:', saboteurPlayers.join(', '));
      // console.log('Innocent Players:', innocentPlayers.join(', '));

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
