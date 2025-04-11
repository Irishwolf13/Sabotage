import { db } from "./config";
import { doc, setDoc, onSnapshot, updateDoc, collection, query, where, arrayUnion, getDocs, getDoc, DocumentData  } from "firebase/firestore";


//////////////////////////////// LISTENING ////////////////////////////////
// Function to subscribe and listen for changes
export const listenForGameChanges = (gameId: string, onChange: (data: any) => void) => {
  const gameDocRef = doc(db, "activeGames", gameId);

  // Set up a listener for the 'players' field
  const unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onChange(data);
    }
  });

  // Return the unsubscribe function to allow cleanup
  return unsubscribe;
};

//////////////////////////////// CREATING ////////////////////////////////
// Function to create a new player account in the Firestore database
export const createPlayerAccount = async (uid: string, email: string, playerName: string) => {
  try {
    // Create a reference to the new player document
    const playerDocRef = doc(db, "playerAccounts", uid);

    // Define the player data to be stored
    const playerData = {
      email,
      playerName,
      createdAt: new Date().toISOString()
    };

    // Set the document with player data
    await setDoc(playerDocRef, playerData);
    console.log("Player account created successfully");
  } catch (err) {
    console.error("Error creating player account:", err);
  }
};

// Function to create a new game instance in the Firestore database
export const createGameDocument = async (id: string, gameName: string, gameCode: string, creator: string, screenName: string) => {
  try {
    const gameDocRef = doc(db, "activeGames", id);

    // Data to be saved in Firestore
    const gameData = {
      gameName,
      gameCode,
      creator,
      createdAt: new Date().toISOString(),
      isEnded: false,
      isStarted: false,
      foundDead: false,
      players: [{screenName: screenName, email:creator, ghost:false, color:'', isSaboteur: false}],
    };

    await setDoc(gameDocRef, gameData);
    console.log("Game document created successfully in Firestore");
  } catch (err) {
    console.error("Error creating game document:", err);
  }
};

//////////////////////////////// JOINING ////////////////////////////////
// Function to join a game by adding the user's email to the players array
export const joinGame = async (gameCode: string, email: string): Promise<string | null> => {
  try {
    const activeGamesRef = collection(db, 'activeGames');
    const q = query(activeGamesRef, where('gameCode', '==', gameCode));
    const querySnapshot = await getDocs(q);
    const myEmail = await getPlayerNameByEmail(email)
    if (!querySnapshot.empty) {
      // Assume there is only one document with a matching game code
      const docSnap = querySnapshot.docs[0];
      const gameData = docSnap.data();
      
      // Check if the gameName exists in the document
      if (gameData && gameData.gameName) {
        // Update to include an object with necessary details like email
        const playerObject = {
          email,          // User's email
          screenName: myEmail, // Default or fetched screen name
          ghost: false,   // Initial value, change as needed
          color: '',      // Default color, change as needed
          isSaboteur: false // Initial role, adjust as per your logic
        };

        await updateDoc(docSnap.ref, {
          players: arrayUnion(playerObject)
        });

        console.log(`Successfully added ${email} to game named ${gameData.gameName}`);
        
        // Return the gameName after successful joining
        return gameData.gameName; 
      } else {
        console.error('The game name is not defined in the document.');
        return null;
      }
    } else {
      console.error('No game found with the entered game code.');
      return null;
    }
  } catch (error) {
    console.error("Error joining game:", error);
    return null;
  }
};


//////////////////////////////// SEARCHING ////////////////////////////////
// This function searches for a player account by email and returns the player's name
export const getPlayerNameByEmail = async (email:string) => {
  try {
    // Reference to the playerAccounts collection
    const playerAccountsRef = collection(db, 'playerAccounts');

    // Create a query against the collection
    const q = query(playerAccountsRef, where("email", "==", email));

    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Check if we have any documents matching the query
    if (!querySnapshot.empty) {
      // Assuming emails are unique, so only one document should match
      const doc = querySnapshot.docs[0];
      const playerData = doc.data();
      
      // Return the player's name
      return playerData.playerName;
    } else {
      throw new Error('No player found with the provided email.');
    }
  } catch (error) {
    console.error("Error fetching player name: ", error);
    throw error; // Re-throw error after logging it
  }
}

export default getPlayerNameByEmail;

//////////////////////////////// EDITING DATABASE ////////////////////////////////
// Function to toggle a boolean field in a Firestore document
export const toggleBooleanField = async (gameId: string, fieldName: string, statusChange: boolean) => {
  const gameDocRef = doc(db, "activeGames", gameId);
  try {
    await updateDoc(gameDocRef, {
      [fieldName]: statusChange
    });
  } catch (error) {
    console.error(`Error updating ${fieldName} status: `, error);
  }
};

// Function to update a string field in a Firestore document
export const updateStringField = async (gameId: string, fieldName: string, newValue: string) => {
  const gameDocRef = doc(db, "activeGames", gameId);
  try {
    await updateDoc(gameDocRef, {
      [fieldName]: newValue
    });
    console.log(`Successfully updated ${fieldName} to ${newValue}`);
  } catch (error) {
    console.error(`Error updating ${fieldName}: `, error);
  }
};

// Function to create and add available rooms to a Firestore document
export const createAvailableRooms = async (gameId: string, numberOfRooms: number) => {
  const gameDocRef = doc(db, "activeGames", gameId);

  // Prepare the array of room objects
  const availableRooms = Array.from({ length: numberOfRooms }, (_, index) => ({
    room: index,
    canUse: false
  }));

  try {
    // Update the Firestore document
    await updateDoc(gameDocRef, {
      availableRooms: availableRooms
    });
    console.log(`Successfully added ${numberOfRooms} rooms to the document.`);
  } catch (error) {
    console.error(`Error adding available rooms: `, error);
  }
};

// Function to set the 'ghost' boolean field to true for a specific player
export const setPlayerGhostTrue = async (gameId: string, playerEmail: string) => {
  const gameDocRef = doc(db, "activeGames", gameId);

  try {
    // Fetch the document
    const docSnap = await getDoc(gameDocRef);
    if (!docSnap.exists()) {
      throw new Error(`Game with ID ${gameId} does not exist.`);
    }

    // Get current game data
    const gameData = docSnap.data();
    let players = gameData.players;

    if (!Array.isArray(players)) {
      throw new Error(`Players field is not an array.`);
    }

    // Find the player index based on email
    const playerIndex = players.findIndex(player => player.email === playerEmail);

    if (playerIndex === -1) {
      throw new Error(`Player with email ${playerEmail} not found.`);
    }

    // Set the ghost status to true
    players[playerIndex].ghost = true;

    // Update the document with modified players array
    await updateDoc(gameDocRef, { players });

  } catch (error) {
    console.error(`Error setting ghost status to true for player with email ${playerEmail}: `, error);
  }
};


// Function to set a player's isSaboteur field to true
export const setPlayerAsSaboteur = async (gameId: string, playerEmail: string) => {
  try {
    // Reference to the game document
    const gameDocRef = doc(db, "activeGames", gameId);
    
    // Retrieve the document snapshot
    const docSnap = await getDoc(gameDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      if (data && data.players) {
        // Map over players to update the isSaboteur property for the matching email
        const updatedPlayers = data.players.map((player: any) => 
          player.email === playerEmail ? { ...player, isSaboteur: true } : player
        );

        // Update the Firestore document with the new players array
        await updateDoc(gameDocRef, { players: updatedPlayers });

        console.log(`Successfully set ${playerEmail} as a saboteur.`);
      } else {
        console.error("The players array does not exist in the document.");
      }
    } else {
      console.error("No such document found for the given gameId.");
    }
  } catch (error) {
    console.error("Error setting player as saboteur:", error);
  }
};

// Function to add room colors (or assignments) to a game document in Firestore
type colorPlayer = { player: number; solved: boolean; type: number; room: number };
export const addRoomColors = async (
  gameId: string,
  resultArray: colorPlayer[]
) => {
  const gameDocRef = doc(db, "activeGames", gameId);

  try {
    await updateDoc(gameDocRef, {
      roomPuzzles: resultArray
    });
    console.log("Room puzzles added successfully in Firestore");
  } catch (error) {
    console.error("Error adding room puzzles:", error);
  }
};

// UPDATE PLAYER COLORS
type PlayerColorsToChange = { email: string; color: string; ghost: boolean; isSaboteur: boolean; screenName: string;};
export const updatePlayerColors = async (
  gameId: string,
  playersToUpdate: PlayerColorsToChange[],
  availableColors: string[]
) => {
  const gameDocRef = doc(db, 'activeGames', gameId);

  try {
    const docSnap = await getDoc(gameDocRef);

    if (!docSnap.exists()) {
      console.error('No such document found for the given gameId.');
      return;
    }

    const data = docSnap.data();
    const currentPlayers = data?.players || [];

    // Track assigned colors to prevent duplicates
    const assignedColors = new Set<string>();

    // Populate assignedColors with existing player colors
    currentPlayers.forEach((player: any) => {
      if (player.color) assignedColors.add(player.color);
    });

    // Assign colors ensuring uniqueness
    const updatedPlayers = currentPlayers.map((player: any) => {
      const updateInfo = playersToUpdate.find(p => p.email === player.email);
      
      if (updateInfo) {
        // Select an unused color
        const availableColor = availableColors.find(color => !assignedColors.has(color));

        if (availableColor) {
          assignedColors.add(availableColor); // Mark this color as used
          return { ...player, color: availableColor }; // Update only the color field
        } else {
          console.warn('Not enough colors in availableColors to assign unique colors.');
          return player; // No change if no colors are left
        }
      }

      return player; // Return unchanged if no updateInfo
    });

    await updateDoc(gameDocRef, {
      //@ts-ignore
      players: updatedPlayers.map(player => ({
        ...player,
        color: player.color
      })),
    });

    console.log('Players updated successfully with unique colors.');
  } catch (error) {
    console.error('Error updating player colors:', error);
  }
};

// Function to assign player numbers and update Firestore
interface assignedPlayer { email: string; screenName: string; ghost: boolean; color: string; isSaboteur: boolean; player?: number;}
export const assignAndUpdatePlayers = async (gameId: string) => {
  const gameDocRef = doc(db, "activeGames", gameId);

  // Retrieve the existing players array from Firestore
  let docSnap;
  try {
    docSnap = await getDoc(gameDocRef);
  } catch (error) {
    console.error("Error retrieving document:", error);
    return;
  }

  if (!docSnap.exists()) {
    console.error("No such document found for the given gameId.");
    return;
  }
  
  const data = docSnap.data();
  const players: assignedPlayer[] = data?.players || [];

  // Reassign player numbers locally
  let playerIndex = 0;
  const updatedPlayers = players.map((player) => {
    if (!player.isSaboteur) {
      player.player = playerIndex;
      playerIndex += 1;
    } else {
      player.player = -1;
    }
    return player;
  });

  // Update the Firestore document with the new players array
  try {
    await updateDoc(gameDocRef, {
      players: updatedPlayers,
    });
    console.log("Updated player numbers successfully in Firestore.");
  } catch (error) {
    console.error("Error updating players:", error);
  }
};


// Function to get base colors from the 'preferences' collection in Firestore
export const getInnocentBaseColors = async (): Promise<string[]> => {
  try {
    // Reference to the 'innocentColors' document within 'preferences'
    const innocentColorsDocRef = doc(db, "preferences", "innocentColors");
    
    // Retrieve the document snapshot
    const docSnap = await getDoc(innocentColorsDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const baseColors: string[] = data?.baseColors || [];
      
      // Return the array of base colors
      return baseColors;
    } else {
      console.error("No such document found for innocentColors.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching base colors:", error);
    return [];
  }
};

// Function to retrieve player colors for a specific room from Firestore
export const getRoomColors = async (gameId: string, myNumber: number): Promise<string[]> => {
  const gameDocRef = doc(db, "activeGames", gameId);
  try {
    // Retrieve the document snapshot
    const docSnap = await getDoc(gameDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const roomPuzzles: { room: number; player: number }[] = data?.roomPuzzles || [];
      const players: { player: number; color: string }[] = data?.players || [];

      // Collect player numbers for the specified room
      const playerNumbersSet = new Set<number>(
        roomPuzzles
          .filter(puzzle => puzzle.room === myNumber)
          .map(puzzle => puzzle.player)
      );

      // Extract colors of players whose numbers are in the set
      const playerColors = players
        .filter(player => playerNumbersSet.has(player.player))
        .map(player => player.color);

      return playerColors;
    } else {
      console.error("No such document found for the given gameId.");
    }
  } catch (error) {
    console.error("Error fetching room colors:", error);
  }

  // Return an empty array if no colors were found or an error occurred
  return [];
};

// Function to add a vote to a game document in Firestore
interface Vote { voter: string; selected: string;}
export const addVote = async (gameId: string, vote: Vote) => {
  const gameDocRef = doc(db, "activeGames", gameId);

  try {
    // Retrieve the current document snapshot
    const docSnap = await getDoc(gameDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Check if 'votes' array exists; if not, initialize it
      if (!data || !data.votes) {
        await updateDoc(gameDocRef, {
          votes: [vote]  // Initialize with the first vote
        });
        console.log("Votes array created and vote added successfully.");
      } else {
        await updateDoc(gameDocRef, {
          votes: arrayUnion(vote)  // Add vote to existing array
        });
        console.log("Vote added successfully to existing votes array.");
      }

    } else {
      console.error("No such document found for the given gameId.");
    }
  } catch (error) {
    console.error("Error adding vote:", error);
  }
};

// Function to clear all votes from a game document in Firestore
export const clearVotes = async (gameId: string) => {
  const gameDocRef = doc(db, "activeGames", gameId);

  try {
    // Set the 'votes' field to an empty array
    await updateDoc(gameDocRef, {
      votes: []  // Clears all objects from the array
    });
    console.log("All votes cleared successfully.");
  } catch (error) {
    console.error("Error clearing votes:", error);
  }
};


// Define interfaces for vote and player structures
interface selectedVote { selected: string; voter: string;}
interface selectedPlayer { email: string; ghost: boolean; isSaboteur: boolean; screenName: string;}
export const evaluateVotes = async (gameId: string): Promise<{ screenName: string; isSaboteur: boolean } | null> => {
  const gameDocRef = doc(db, "activeGames", gameId);

  try {
    // Fetch the game document
    const gameDoc = await getDoc(gameDocRef);
    if (!gameDoc.exists()) {
      throw new Error("Game does not exist.");
    }

    const gameData = gameDoc.data() as DocumentData;
    const votes: selectedVote[] = gameData?.votes || [];
    const players: selectedPlayer[] = gameData?.players || [];

    // Tally votes
    const voteCount = votes.reduce<Record<string, number>>((acc, { selected }) => {
      acc[selected] = (acc[selected] || 0) + 1;
      return acc;
    }, {});

    // Determine the player(s) with the most votes
    const maxVotes = Math.max(...Object.values(voteCount));
    let candidates = Object.keys(voteCount).filter(email => voteCount[email] === maxVotes);

    if (candidates.length > 1) {
      // Filter out any saboteurs from candidates
      candidates = candidates.filter(email => !players.find(player => player.email === email)?.isSaboteur);
      
      if (candidates.length < 1) {
        // If all candidates were saboteurs, return no eligible candidate
        console.log("No valid candidates after filtering for saboteurs.");
        return null;
      }
    }

    // Select one candidate at random among potential candidates
    const chosenEmail = candidates[Math.floor(Math.random() * candidates.length)];

    // Update the chosen player's 'ghost' status
    const updatedPlayers = players.map(player => {
      if (player.email === chosenEmail) {
        return { ...player, ghost: true };
      }
      return player;
    });

    await updateDoc(gameDocRef, { players: updatedPlayers });

    // Find the chosen player and return their screenName and isSaboteur status
    const chosenPlayer = players.find(player => player.email === chosenEmail);
    return { screenName: chosenPlayer!.screenName, isSaboteur: chosenPlayer!.isSaboteur };

  } catch (error) {
    console.error(`Error processing votes: `, error);
    return null;
  }
};



// Function to evaluate game status based on players' ghost and saboteur status
export const evaluateGameStatus = async (gameId: string) => {
  const gameDocRef = doc(db, "activeGames", gameId);

  try {
    // Fetch the game document
    const gameDoc = await getDoc(gameDocRef);
    if (!gameDoc.exists()) {
      throw new Error("Game does not exist.");
    }

    // Retrieve player data
    const players: { ghost: boolean; isSaboteur: boolean }[] = gameDoc.data()?.players || [];
    
    // Check for active saboteurs
    const activeSaboteursCount = players.filter(player => player.isSaboteur && !player.ghost).length;
    if (activeSaboteursCount === 0) {
      // return { gameOver: true, innocentsWin: true }; // Innocents win if no active saboteurs are left
      toggleBooleanField(gameDoc.id, 'isEnded', true)
      toggleBooleanField(gameDoc.id, 'saboteurWins', false)
      return
    }

    // Count active innocents
    const activeInnocentsCount = players.filter(player => !player.isSaboteur && !player.ghost).length;

    // Determine game outcome based on counts
    if (activeInnocentsCount <= activeSaboteursCount) {
      // return { gameOver: true, innocentsWin: false }; // Saboteurs win if they are equal to or outnumber active innocents
    
      toggleBooleanField(gameDoc.id, 'isEnded', true)
      toggleBooleanField(gameDoc.id, 'saboteurWins', true)
      return
    }

    // return { gameOver: false, innocentsWin: false }; // Game continues if innocents outnumber saboteurs

    toggleBooleanField(gameDoc.id, 'isEnded', false)
    toggleBooleanField(gameDoc.id, 'saboteurWins', false)

  } catch (error) {
    console.error("Error evaluating game status:", error);
    // Default return to indicate ongoing game in case of errors
    return;
  }
};

// Function to check room puzzles and return their status as an array of objects
export const subscribeToRoomPuzzleStatus = (gameId: string, callback: (status: Array<{ room: number; sabotaged: boolean }>) => void) => {
  const gameDocRef = doc(db, "activeGames", gameId);

  const unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
    if (!docSnap.exists()) {
      console.error(`Document with id ${gameId} does not exist`);
      return;
    }

    const data = docSnap.data();

    if (!data || !Array.isArray(data.roomPuzzles)) {
      console.error("Invalid or missing 'roomPuzzles' array");
      return;
    }

    const roomStatusMap = new Map<number, boolean>();

    data.roomPuzzles.forEach((puzzle: { room: number; sabotaged: boolean }) => {
      const currentStatus = roomStatusMap.get(puzzle.room) || false;
      roomStatusMap.set(puzzle.room, currentStatus || puzzle.sabotaged);
    });

    const roomStatusArray = Array.from(roomStatusMap, ([room, sabotaged]) => ({ room, sabotaged }));

    callback(roomStatusArray);
  }, (error) => {
    console.error("Error listening to room puzzles:", error);
  });

  return unsubscribe; // Call this function to stop listening to updates
};

// Function to toggle the sabotage status of a specific room
export const updateRoomSabotageStatus = async (gameId: string, room: number) => {
  try {
    const gameRef = doc(db, "activeGames", gameId);
    const docSnap = await getDoc(gameRef);

    if (!docSnap.exists()) {
      throw new Error(`Game document with id ${gameId} does not exist`);
    }

    const data = docSnap.data();
    if (!data || !Array.isArray(data.roomPuzzles)) {
      throw new Error("Invalid or missing 'roomPuzzles' array in document");
    }

    const updatedRoomPuzzles = data.roomPuzzles.map((puzzle: { room: number; sabotaged: boolean }) =>
      puzzle.room === room ? { ...puzzle, sabotaged: !puzzle.sabotaged } : puzzle
    );

    await updateDoc(gameRef, { roomPuzzles: updatedRoomPuzzles });
    // console.log(`Updated sabotage status for room: ${room}`);
  } catch (error) {
    console.error("Error updating sabotage status:", error);
  }
};

// Function to check if any room with the specified number has been sabotaged
interface RoomPuzzle { room: number; sabotaged: boolean; solved: boolean;}
export const isRoomSabotaged = async (gameId: string, roomNumber: number): Promise<boolean> => {
  try {
    // Reference to the game document
    const gameDocRef = doc(db, "activeGames", gameId);

    // Get the document snapshot
    const gameDocSnap = await getDoc(gameDocRef);

    if (gameDocSnap.exists()) {
      // Extract data
      const gameData = gameDocSnap.data();

      // Assuming roomPuzzles is an array in the game document
      if (Array.isArray(gameData.roomPuzzles)) {
        // Check for any room with the specified number that is sabotaged
        return gameData.roomPuzzles.some((puzzle: RoomPuzzle) => 
          puzzle.room === roomNumber && puzzle.sabotaged === true
        );
      }
    }
    
    return false; // Return false if no matching rooms are found or the document does not exist
  } catch (error) {
    console.error("Error checking room sabotage status:", error);
    throw new Error("Failed to check room sabotage status.");
  }
};