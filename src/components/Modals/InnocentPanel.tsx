import React from 'react';
import { useSelector } from 'react-redux';
import './InnocentPanel.css';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import { useAuth } from '../../firebase/AuthContext';

interface Room {
  order: number;
  room: string;
  solved: boolean;
}

interface Player {
  email: string;
  isSaboteur: boolean;
  rooms?: Room[];
}

interface Game {
  players: Player[];
}

const InnocentPanel: React.FC<{ gameId: string }> = ({ gameId }) => {
  useGameSubscription();
  const game = useSelector((state: RootState) => state.games?.[0]) as Game | undefined;
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="control-panel">
        <h2>Puzzle Order</h2>
        <p>Loading user information...</p>
      </div>
    );
  }

  // Count all rooms and solved rooms from non-saboteur players
  let totalRooms = 0;
  let solvedRooms = 0;

  game?.players.forEach(player => {
    if (!player.isSaboteur && player.rooms) {
      totalRooms += player.rooms.length;
      solvedRooms += player.rooms.filter(room => room.solved).length;
    }
  });

  // Calculate completion percentage and round down
  const completionPercentage = totalRooms > 0 ? Math.floor((solvedRooms / totalRooms) * 100) : 0;

  return (
    <div className="control-panel">
      <div className='statusBarHolder'>
        <h3 style={{ color: '#301000' }}>Team Puzzle Completion</h3>
        <div className="statusBar">
          {completionPercentage > 0 && (
            <div className='statusBarFilled' style={{
              height: '20px',
              width: `${completionPercentage}%`,
              backgroundColor: '#ff970f'
            }}>
              <span style={{ color: '#301000' }}>{completionPercentage}%</span>
            </div>
          )}
        </div>
      </div>
  
      <h2 style={{ color: '#301000' }}>Your Puzzle Order</h2>
      {/* Display player's rooms */}
      {game && game.players.map((player, index) =>
        player.email === user.email && player.rooms ? (
          player.rooms.map((room, idx) => (
            <div key={idx}>
              <div className='roomStatusBar'>
                <span>Puzzle {room.order + 1}</span>
                <span>Room: {room.room}</span>
                <span style={{ color: room.solved ? 'green' : 'red', fontWeight: 'bold' }}>
                  {room.solved ? 'Solved' : 'Unsolved'}
                </span>
              </div>
            </div>
          ))
        ) : null
      )}
    </div>
  );
};

export default InnocentPanel;
