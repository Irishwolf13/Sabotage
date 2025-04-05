import { db } from "./config";
import { doc, setDoc, onSnapshot, updateDoc, collection, query, where, arrayUnion, getDocs, getDoc } from "firebase/firestore";


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

    if (!querySnapshot.empty) {
      // Assume there is only one document with a matching game code
      const docSnap = querySnapshot.docs[0];
      const gameData = docSnap.data();
      
      // Check if the gameName exists in the document
      if (gameData && gameData.gameName) {
        // Update to include an object with necessary details like email
        const playerObject = {
          email,          // User's email
          screenName: '', // Default or fetched screen name
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

//////////////////////////////// EDITING DATABASE ////////////////////////////////
// Function to toggle a boolean field in a Firestore document
export const toggleBooleanField = async (gameId: string, fieldName: string, currentStatus: boolean) => {
  const gameDocRef = doc(db, "activeGames", gameId);
  try {
    await updateDoc(gameDocRef, {
      [fieldName]: !currentStatus
    });
  } catch (error) {
    console.error(`Error updating ${fieldName} status: `, error);
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








type Player = {
  email: string;
  color: string;
  ghost: boolean;
  isSaboteur: boolean;
  screenName: string;
};

export const updatePlayerColors = async (
  gameId: string,
  playersToUpdate: Player[],
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