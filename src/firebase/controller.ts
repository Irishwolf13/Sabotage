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
export const createGameDocument = async (id: string, gameName: string, gameCode: string, creator: string) => {
  try {
    const gameDocRef = doc(db, "activeGames", id);

    // Data to be saved in Firestore
    const gameData = {
      gameName,
      gameCode,
      creator,
      players: [creator],
      isEnded: false,
      isStarted: false,
      foundDead: false,
      createdAt: new Date().toISOString(),
      roles: {innocents:[], saboteur:[]}
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
        await updateDoc(docSnap.ref, {
          players: arrayUnion(email)
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

//////////////////////////////// UPDATING ROLES ////////////////////////////////
interface PlayerRole {
  email: string;
  color: string;
}
// Function to update player roles in a Firestore document
export const updatePlayerRoles = async (gameId: string, saboteur: PlayerRole[], innocents: PlayerRole[]) => {
  const gameDocRef = doc(db, "activeGames", gameId);
  try {
    await updateDoc(gameDocRef, {
      roles: {
        saboteur,
        innocents
      }
    });
    console.log("Player roles updated successfully in Firestore");
  } catch (error) {
    console.error("Error updating player roles: ", error);
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