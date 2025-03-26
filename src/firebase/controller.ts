import { db } from "./config";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

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