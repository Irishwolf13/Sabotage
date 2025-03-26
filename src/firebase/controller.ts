import { db } from "./config";
import { doc, setDoc, onSnapshot, updateDoc, collection, query, where, arrayUnion, getDocs, } from "firebase/firestore";
// Function to subscribe and listen for changes
export const listenForGameEnd = (gameId: string, onGameEnd: () => void) => {
  const gameDocRef = doc(db, "games", gameId);

  // Set up a listener for the 'isEnded' field
  onSnapshot(gameDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.isEnded) {
        onGameEnd();
      }
    }
  });
};

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
      players: [creator, ],
      isEnded: false,
      createdAt: new Date().toISOString()
    };

    await setDoc(gameDocRef, gameData);
    console.log("Game document created successfully in Firestore");
  } catch (err) {
    console.error("Error creating game document:", err);
  }
};

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

// Add this in controller.ts or wherever you manage Firestore interactions
export const toggleGameEndedStatus = async (gameId: string, currentStatus: boolean) => {
  const gameDocRef = doc(db, "activeGames", gameId);
  try {
    await updateDoc(gameDocRef, {
      isEnded: !currentStatus
    });
  } catch (error) {
    console.error("Error updating game status: ", error);
  }
};

// Function to join a game by adding the user's email to the players array
export const joinGame = async (gameCode: string, email: string) => {
  try {
    const activeGamesRef = collection(db, 'activeGames');
    const q = query(activeGamesRef, where('gameCode', '==', gameCode));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (docSnap) => {
        // Update the players array by adding the user's email
        await updateDoc(docSnap.ref, {
          players: arrayUnion(email)
        });
        console.log(`Successfully added ${email} to game with code ${gameCode}`);
      });
    } else {
      throw new Error('No game found with the entered game code.');
    }
  } catch (error) {
    console.error("Error joining game:", error);
  }
};