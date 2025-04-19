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
      isPlayerDead: false,
      players: [{screenName: screenName, email:creator, ghost:false, isSaboteur: false}],
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

// Function to check what rooms are available to the saboteur
export const getAvailableRooms = async (gameId:string) => {
  const gameDocRef = doc(db, "activeGames", gameId);
  const docSnap = await getDoc(gameDocRef);

  if (docSnap.exists()) {
    return docSnap.data().availableRooms;
  }
  
  throw new Error("No such document!");
};

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
export const createAvailableRooms = async (gameId: string, roomNumbers: number[]) => {
  const gameDocRef = doc(db, "activeGames", gameId);

  // Utility function to generate a random 4-digit number
  const generateRandomCode = () => Math.floor(1000 + Math.random() * 9000);

  // Prepare the array of room objects based on specified room numbers
  const availableRooms = roomNumbers.map(roomNumber => ({
    room: roomNumber,
    canUse: false,
    isSabotaged: false,
    code: generateRandomCode(),
  }));

  try {
    // Update the Firestore document with the available rooms
    await updateDoc(gameDocRef, {
      availableRooms: availableRooms
    });
    console.log(`Successfully added rooms ${roomNumbers.join(', ')} to the document.`);
  } catch (error) {
    console.error(`Error adding available rooms: `, error);
  }
};

// Function to adjust available rooms in Firestore document
export const adjustSaboteurAvailableRooms = async (gameId: string, myNumber: number) => {
  const gameDocRef = doc(db, "activeGames", gameId);
  try {
    // Get the current document snapshot
    const docSnap = await getDoc(gameDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const availableRooms = data.availableRooms || [];

      // Update the rooms based on myNumber
      const updatedRooms = availableRooms.map((roomObj: { room: number; canUse: boolean }) => {
        if (myNumber === -1) {
          return { ...roomObj, canUse: false }; // Set all canUse to false
        } else if (roomObj.room === myNumber) {
          return { ...roomObj, canUse: true }; // Set canUse to true for matching room number
        }
        return roomObj;
      });

      // Update the Firestore document with the modified rooms
      await updateDoc(gameDocRef, {
        availableRooms: updatedRooms
      });

      console.log(`Successfully adjusted available rooms based on myNumber: ${myNumber}`);
    } else {
      console.error("No such document exists!");
    }
  } catch (error) {
    console.error("Error adjusting available rooms: ", error);
  }
};


// Function to set the 'ghost' boolean field to true for a specific player
// Also sets isPlayerDead to true
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

    // Set ghost status to true for the player
    players[playerIndex].ghost = true;

    // Update the document with modified players array and isPlayerDead field
    await updateDoc(gameDocRef, { 
      players, 
      isPlayerDead: true 
    });

  } catch (error) {
    console.error(`Error setting ghost status and isPlayerDead to true for player with email ${playerEmail}: `, error);
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

// Function to assign player numbers and update Firestore
interface AssignedPlayer { email: string; screenName: string; ghost: boolean; isSaboteur: boolean; player?: number; rooms?: RoomOrder[];}
interface RoomOrder { order: number; room: number; solved: boolean;}
export const assignAndUpdatePlayers = async (
  gameId: string, 
  roomOrders: RoomOrder[][]
) => {
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
  const players: AssignedPlayer[] = data?.players || [];

  // Reassign player numbers locally and add room orders
  let playerIndex = 0;
  const nonSaboteurRoomOrders = roomOrders.slice();  // Clone the roomOrders array

  const updatedPlayers = players.map((player) => {
    if (!player.isSaboteur) {
      player.player = playerIndex++;
      
      // Assign room orders only to non-saboteurs
      player.rooms = nonSaboteurRoomOrders.shift() || [];
    } else {
      player.player = -1;
      player.rooms = [];  // Clear rooms for saboteurs
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

// Function to toggle the sabotage status of a specific room
export const updateRoomSabotageStatus = async (gameId: string, room: number) => {
  try {
    // Reference to the game document
    const gameDocRef = doc(db, "activeGames", gameId);

    // Fetch the document snapshot
    const docSnap = await getDoc(gameDocRef);

    // Check if the document exists
    if (docSnap.exists()) {
      const data = docSnap.data();

      // Assuming 'availableRooms' is an array of Room objects
      const availableRooms: SabotagedRoom[] = data.availableRooms || [];

      // Update the isSabotaged status for each room
      const updatedAvailableRooms = availableRooms.map(currentRoom => ({
        ...currentRoom,
        isSabotaged: currentRoom.room === room, // Set true only for the specified room, false for others
      }));

      // Update Firestore document with the modified availableRooms
      await updateDoc(gameDocRef, {
        availableRooms: updatedAvailableRooms
      });

      console.log(`Updated sabotage status for room ${room}.`);
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error updating room sabotage status:", error);
  }
};

interface SabotagedRoom { room: number; isSabotaged: boolean;}
export const isRoomSabotaged = async (gameId: string, currentRoom: number): Promise<boolean> => {
  try {
    // Reference to the game document
    const gameDocRef = doc(db, "activeGames", gameId);

    // Fetch the document snapshot
    const docSnap = await getDoc(gameDocRef);

    // Check if the document exists
    if (docSnap.exists()) {
      const data = docSnap.data();

      // Assuming 'availableRooms' is an array of Room objects
      const availableRooms: SabotagedRoom[] = data.availableRooms || [];

      // Find the room object matching the currentRoom
      const myRoom = availableRooms.find((room) => room.room === currentRoom);

      // Return true or false based on the 'isSabotaged' field
      return myRoom ? myRoom.isSabotaged : false;
    } else {
      console.log("No such document!");
      return false;
    }
  } catch (error) {
    console.error("Error checking room sabotage status:", error);
    return false;
  }
};


export const setRoomSabotageFalse = async (gameId: string, currentRoom: number) => {
  try {
    // Reference to the game document
    const gameDocRef = doc(db, "activeGames", gameId);

    // Fetch the document snapshot
    const docSnap = await getDoc(gameDocRef);

    // Check if the document exists
    if (docSnap.exists()) {
      const data = docSnap.data();

      // Assuming 'availableRooms' is an array of Room objects
      const availableRooms: SabotagedRoom[] = data.availableRooms || [];

      // Find the index of the room object matching the currentRoom
      const roomIndex = availableRooms.findIndex((room) => room.room === currentRoom);

      if (roomIndex !== -1) {
        // Set the isSabotaged field to false for the found room
        availableRooms[roomIndex].isSabotaged = false;

        // Update the document with the modified rooms array
        await updateDoc(gameDocRef, { availableRooms });

        console.log(`Room ${currentRoom} sabotage status set to false.`);
      } else {
        console.log(`Room ${currentRoom} not found.`);
      }

    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error setting room sabotage status to false:", error);
  }
};


// Function to find if the user's room matches the given number
export const checkRoomMatch = async ( gameId: string, myEmail: string, myNumber: number,): Promise<boolean> => {
  try {
    // Reference to the specific game document
    const gameDocRef = doc(db, "activeGames", gameId);
    
    // Fetch the document snapshot
    const docSnap = await getDoc(gameDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      if (!data.players) {return false;} // If no player

      const player = data.players.find((p: any) => p.email === myEmail);
      
      if (!player || !player.rooms) { return false; } // If no player or rooms are found, return false

      for (const roomObj of player.rooms) {
        if (!roomObj.solved && roomObj.room === myNumber) {
          return true; // Return true if there's an unsolved room that matches myNumber
        }
        if (!roomObj.solved) {
          break; // Stop searching after finding the first unsolved room
        }
      }
    }

    return false; // Return false if conditions aren't met
  } catch (error) {
    console.error("Error checking room match:", error);
    return false; // Return false in case of error
  }
};

// Function to update room status for a specific player
export const updateRoomStatus = async (gameId: string, email: string, roomNumber: number) => {
  try {
    // Reference to the specific game document
    const gameDocRef = doc(db, "activeGames", gameId);

    // Fetch the game document
    const gameSnapshot = await getDoc(gameDocRef);
    
    if (!gameSnapshot.exists()) {
      throw new Error("Game document does not exist.");
    }
    
    const data = gameSnapshot.data();

    // Ensure players is an array
    const players = Array.isArray(data?.players) ? data.players : [];
    
    if (players.length === 0) {
      throw new Error("No players found in the game document.");
    }

    // Find the player by email
    const playerIndex = players.findIndex((player: any) => player.email === email);

    if (playerIndex === -1) {
      throw new Error("Player with the given email not found.");
    }

    // Access and verify player's rooms
    const playerRooms = Array.isArray(players[playerIndex].rooms) ? players[playerIndex].rooms : [];
    const roomIndex = playerRooms.findIndex((room: any) => room.room === roomNumber);

    if (roomIndex === -1) {
      throw new Error("Room with the given room number not found for the player.");
    }

    // Update the 'solved' status of the specific room
    playerRooms[roomIndex].solved = true;

    // Update the entire players array in Firestore
    await updateDoc(gameDocRef, {
      players: players
    });

    console.log(`Room number ${roomNumber} for player ${email} has been marked as solved.`);
  
  } catch (error) {
    console.error("Error updating room status:", error);
  }
};