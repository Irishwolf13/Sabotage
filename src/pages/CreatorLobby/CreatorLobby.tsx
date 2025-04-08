import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory from react-router-dom
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonButton,
  IonList,
  IonItem,
} from '@ionic/react';
import './CreatorLobby.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import { setGames } from '../../stores/gameSlice';
import { auth } from '../../firebase/config';
import StartGameModal from '../../components/Modals/StartGameModal';
import {
  listenForGameChanges,
  toggleBooleanField,
  getInnocentBaseColors,
  addRoomColors,
  setPlayerAsSaboteur,
  assignAndUpdatePlayers,
  updatePlayerColors,
} from '../../firebase/controller';

const CreatorLobby: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const game = useSelector((state: RootState) => state.games[0]);
  const [numSlots, setnumSlots] = useState(8);
  const [numRooms, setnumRooms] = useState(5);
  const [numSaboteurs, setNumSaboteurs] = useState(1);
  const [email, setEmail] = useState<string | null>(null);
  const games = useSelector((state: RootState) => state.games);
  const currentGame = games.length > 0 ? games[0] : undefined;

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
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
              saboteurWins: false,
              isStarted: data.isStarted,
              foundDead: data.foundDead,
              currentRoom: -1,
              calledMeeting: '',
              allVotesCast: false,
              kickedPlayer: '',
              votes:[]
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
    await toggleBooleanField(game.id, key, !value);
  };

  const shuffleArray = (array: any) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const selectRandomColors = (
    availableColors: any,
    totalPlayers: any,
    myPlayers: any
  ) => {
    const usedColors = new Set<string>();

    if (availableColors.length < totalPlayers) {
      console.log('Not enough available colors for all players.');
      return;
    }

    // Assign unique colors to each player
    myPlayers.forEach((player: any, index: any) => {
      player.color = availableColors[index];
      usedColors.add(player.color);
    });

    console.log('myPlayers with assigned colors:', myPlayers);
  };

  // Randomly assign saboteurs
  const selectRandomSaboteur = async (totalPlayers: any, myPlayers: any) => {
    for (let i = 0; i < numSaboteurs; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * totalPlayers);
        console.log(randomIndex)
      } while (myPlayers[randomIndex].isSaboteur);
      console.log(randomIndex)
      myPlayers[randomIndex].isSaboteur = true;
      await setPlayerAsSaboteur(game.id, myPlayers[randomIndex].email)
    }
  };

  type roomPlayer = { player: number; solved: boolean; sabotaged:boolean, type: number };
  const assignPlayersEvenly = (
    numberOfPlayers: number,
    numberOfRooms: number
  ) => {
    const roomPuzzles: roomPlayer[][] = Array.from(
      { length: numberOfRooms },
      () => []
    );
    const playerAssignments = Array.from(
      { length: numberOfPlayers },
      () => new Set<number>()
    );
    const roomCounts = Array(numberOfRooms).fill(0);
    const playerTypeCounter: number[] = Array(numberOfPlayers).fill(0);

    for (let player = 0; player < numberOfPlayers; player++) {
      while (playerAssignments[player].size < 3) {
        const thresholds = [...new Set(roomCounts)].sort((a, b) => a - b);
        let assigned = false;

        for (const threshold of thresholds) {
          const candidates = roomCounts
            .map((count, index) => ({ count, index }))
            .filter(
              (r) =>
                r.count === threshold && !playerAssignments[player].has(r.index)
            )
            .map((r) => r.index);

          if (candidates.length > 0) {
            const room =
              candidates[Math.floor(Math.random() * candidates.length)];
            playerAssignments[player].add(room);

            // Add player to room with a type count
            roomPuzzles[room].push({
              player: player,
              solved: false,
              sabotaged: false,
              type: playerTypeCounter[player]++,
            });

            roomCounts[room]++;
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          throw new Error(`Unable to assign player ${player + 1} a third room`);
        }
      }
    }

    // Create the new array with added 'room' key
    const resultArray = [];
    for (let roomIndex = 0; roomIndex < roomPuzzles.length; roomIndex++) {
      for (const playerObject of roomPuzzles[roomIndex]) {
        resultArray.push({
          room: roomIndex,
          ...playerObject,
        });
      }
    }
    return resultArray;
  };

  const handleStartGame = async (numSaboteurs: number) => {
    if (game.players && game.players.length > 0) {
      const totalPlayers = game.players.length;
      let availableColors = await getInnocentBaseColors();
      let myPlayers = [...game.players.map((player) => ({ ...player }))];

      shuffleArray(availableColors);
      selectRandomSaboteur(totalPlayers, myPlayers);
      selectRandomColors(availableColors, totalPlayers, myPlayers);
      const roomPuzzles = assignPlayersEvenly(totalPlayers - numSaboteurs, numRooms);
      await addRoomColors(game.id, roomPuzzles);
      await assignAndUpdatePlayers(game.id)
      await updatePlayerColors(game.id, myPlayers, availableColors)
      await handleToggleStatus('isStarted', game.isStarted);
    } else {
      console.log('No players available for role assignment.');
    }
  };

  const decreaseNumSlots = () => {
    setnumSlots((prev) => Math.max(prev - 1, game.players.length));
  };

  const increaseNumSlots = () => {
    setnumSlots((prev) => Math.min(prev + 1, 16));
  };

  const decreaseNumRooms = () => {
    setnumRooms((prev) => Math.max(prev - 1, 1));
  };

  const increaseNumRooms = () => {
    setnumRooms((prev) => Math.min(prev + 1, 16));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setNumSaboteurs(isNaN(value) ? 1 : value);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{email || 'User'}</IonTitle>
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
          {Array(numSlots)
            .fill(null)
            .map((_, index) => (
              <IonItem key={index}>
                {/* This will be screenName instead of player.email soon enough */}
                {game.players[index]
                  ? game.players[index].screenName
                  : 'Open Slot'}
              </IonItem>
            ))}
        </IonList>
        <div>
          <label htmlFor="saboteurs">Number of Saboteurs:</label>
          <input
            id="saboteurs"
            type="number" 
            min="1"
            max="3" // Adjust max based on your game constraints
            value={numSaboteurs}
            onChange={handleChange}
          />
        </div>
        <IonButton onClick={() => handleStartGame(numSaboteurs)}>Start Game!</IonButton>
        <StartGameModal isStarted={!!game?.isStarted} currentGameId={game?.id}/>
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
