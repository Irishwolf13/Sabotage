import React, { useEffect, useState } from 'react';
import { IonToast } from '@ionic/react';
import { useAuth } from '../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';


const AlarmScanner: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);

  useEffect(() => {
    if (!game || !user?.email || !game.isAlarmActive || showToast) return;

    const player = game.players.find(p => p.email === user.email);
    if (player && !player.ghost) {
      setShowToast(true);
    }
  }, [game?.isAlarmActive, user, showToast]);

  return (
    <IonToast
      isOpen={showToast}
      onDidDismiss={() => setShowToast(false)}
      message="Alarm Going Off"
      duration={4000}
      buttons={[
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => setShowToast(false),
        },
      ]}
    />
  );
};

export default AlarmScanner;
