// roomAssignment.ts
type Room = number[];

// Function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

// Helper function to check if a player can join a room
function canJoinRoom(player: number, room: Room, paired: boolean[][]): boolean {
    if (room.length >= 3) return false; // Ensure no more than 3 players in a room initially
    for (let p of room) {
        if (paired[player][p]) return false;
    }
    return true;
}

export function assignPlayersToRooms(numRooms: number, numPlayers: number): Room[] {
    // Initialize the rooms
    let rooms: Room[] = Array.from({ length: numRooms }, () => []);

    // To track if a pair of players has already been in a room together
    let paired: boolean[][] = Array.from({ length: numPlayers }, () => Array(numPlayers).fill(false));

    // Shuffle player order
    const shuffledPlayers = shuffleArray(Array.from({ length: numPlayers }, (_, i) => i));

    // Step 1: Initial assignment without overlaps
    for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
        const player = shuffledPlayers[playerIndex];
        let roomsJoined = 0;

        for (let roomIndex = 0; roomIndex < numRooms; roomIndex++) {
            if (roomsJoined >= 3) break;

            if (canJoinRoom(player, rooms[roomIndex], paired)) {
                // Assign player to the room
                rooms[roomIndex].push(player);

                // Mark these players as paired
                for (let p of rooms[roomIndex]) {
                    if (p !== player) {
                        paired[player][p] = true;
                        paired[p][player] = true;
                    }
                }

                roomsJoined++;
            }
        }
    }

    // Step 2: Fill remaining spots with random room assignment
    for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
        const player = shuffledPlayers[playerIndex];
        let roomsJoined = rooms.filter(room => room.includes(player)).length;

        while (roomsJoined < 3) {
            const shuffledRoomIndices = shuffleArray(Array.from({ length: numRooms }, (_, i) => i));

            for (let roomIndex of shuffledRoomIndices) {
                if (!rooms[roomIndex].includes(player)) {
                    // No additional restriction on room size for this step
                    rooms[roomIndex].push(player);
                    roomsJoined++;

                    if (roomsJoined >= 3) break;
                }
            }
        }
    }

    // Shuffle rooms to randomize their order
    return shuffleArray(rooms);
}
