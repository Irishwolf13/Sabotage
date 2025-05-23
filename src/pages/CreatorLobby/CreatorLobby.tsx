import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonButton, IonList, IonItem } from '@ionic/react';
import { listenForGameChanges, toggleBooleanField, setPlayerAsSaboteur, assignAndUpdatePlayers, createAvailableRooms } from '../../firebase/controller';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import { setGames } from '../../stores/gameSlice';
import { auth } from '../../firebase/config';
import StartGameModal from '../../components/Modals/StartGameModal';
import './CreatorLobby.css';

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
              isPlayerDead: data.isPlayerDead,
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
    return <p>Oppps, something went wrong and your game is missing... Lost to the void... Sabotaged...? Not sure.</p>;
  }


  // Randomly assign saboteurs
  const selectRandomSaboteur = async (totalPlayers: any, myPlayers: any) => {
    for (let i = 0; i < numSaboteurs; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * totalPlayers);
        // console.log(randomIndex)
      } while (myPlayers[randomIndex].isSaboteur);
      // console.log(randomIndex)
      myPlayers[randomIndex].isSaboteur = true;
      await setPlayerAsSaboteur(game.id, myPlayers[randomIndex].email)
    }
  };

  // This is the big one... evenly spreads out players across rooms in the best way possible... I hope.
  type PlayerRoom = { room: number; order: number; solved: boolean };
  const assignPlayersEvenly = (numberOfPlayers: number, roomNumbers: number[]): PlayerRoom[][] => {
    const numberOfRooms = roomNumbers.length;
    
    const roomPuzzles: { player: number; order: number; solved: boolean }[][] = Array.from(
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
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const roomIdx = candidates[randomIndex];
            const room = roomNumbers[roomIdx]; // Get the actual room number here
            
            playerAssignments[player].add(room);

            roomPuzzles[roomIdx].push({
              player: player,
              order: playerTypeCounter[player]++,
              solved: false,
            });

            roomCounts[roomIdx]++;
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          throw new Error(`Unable to assign player ${player + 1} a third room`);
        }
      }
    }

    // Create final player-specific structure
    const playerResults: PlayerRoom[][] = Array.from(
      { length: numberOfPlayers },
      () => []
    );

    for (let roomIndex = 0; roomIndex < roomPuzzles.length; roomIndex++) {
      for (const { player, order, solved } of roomPuzzles[roomIndex]) {
        playerResults[player].push({
          room: roomNumbers[roomIndex], // Get the actual room number here
          order,
          solved,
        });
      }
    }

    // Sort each player's assignments by type
    for (const assignments of playerResults) {
      assignments.sort((a, b) => a.order - b.order);
    }

    return playerResults;
  };


  const handleToggleStatus = async (key: any, value: any) => {
    await toggleBooleanField(game.id, key, !value);
  };

  const handleStartGame = async (numSaboteurs: number) => {
    if (game.players && game.players.length > 0) {
      const totalPlayers = game.players.length;
      let myPlayers = [...game.players.map((player) => ({ ...player }))];

      await selectRandomSaboteur(totalPlayers, myPlayers);
      // Frank, this is gonig to be changed eventually, because we want to be albe to adjust rooms
      const roomPuzzles = assignPlayersEvenly(totalPlayers - numSaboteurs, [1,2,3,4,5]);
      await createAvailableRooms(game.id, [1,2,3,4,5])
      await assignAndUpdatePlayers(game.id, roomPuzzles)
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
      <IonContent fullscreen>
      <div className='mainPageButtonHolder'>
        <h1 className='joinCode'>Join Code: <strong>{game.code}</strong></h1>
        <IonButton className='yellowButton' onClick={() => handleStartGame(numSaboteurs)}>Start Game!</IonButton>
        <StartGameModal isStarted={!!game?.isStarted} currentGameId={game?.id} />
        <h3 className='coloredText'>{game.isStarted ? 'Get Ready!' : 'In Lobby'}</h3>
        {/* <IonButton onClick={decreaseNumSlots}>Slot -</IonButton>
        <IonButton onClick={increaseNumSlots}>Slot +</IonButton>
        {numSlots}
        <IonButton onClick={decreaseNumRooms}>Room -</IonButton>
        <IonButton onClick={increaseNumRooms}>Room +</IonButton>
        {numRooms} */}
        <div className='flex2Col'>
          {Array(numSlots)
            .fill(null)
            .map((_, index) => (
              <div key={index} className='lobbyItem'>
                {game.players[index]
                  ? game.players[index].screenName
                  : 'Open Slot'}
              </div>
            ))
          }
        </div>
        {/* <div>
          <label htmlFor="saboteurs">Number of Saboteurs:</label>
          <input
          id="saboteurs"
          type="number" 
          min="1"
          max="3" // Adjust max based on your game constraints
          value={numSaboteurs}
          onChange={handleChange}
          />
          </div> */}

      </div>
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
