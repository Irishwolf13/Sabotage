import React, { useEffect } from 'react';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import './InnocentPanel.css';
import { useSelector } from 'react-redux';
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
  rooms?: Room[];
}

interface Game {
  players: Player[];
}

const InnocentPanel: React.FC<{ gameId: string }> = ({ gameId }) => {
  useGameSubscription();
  const game = useSelector((state: RootState) => state.games?.[0]) as Game | undefined;
  const { user } = useAuth();
  const myPlayer = game?.players.find((player) => player.email === user?.email);

  if (!user) {
    return (
      <div className="control-panel">
        <h2>Detectives</h2>
        <p>Loading user information...</p>
      </div>
    );
  }

  if (!myPlayer || !myPlayer.rooms || myPlayer.rooms.length === 0) {
    return (
      <div className="control-panel">
        <h2>Detectives</h2>
        <p>No rooms assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="control-panel">
      <h2>Detectives</h2>
      <IonList>
        {myPlayer.rooms.map((room, index) => (
          <IonItem key={index}>
            <IonLabel>
              {room.order + 1}: Room: {room.room}, Solved: {room.solved ? 'Yes' : 'No'}
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
    </div>
  );
};

export default InnocentPanel;
