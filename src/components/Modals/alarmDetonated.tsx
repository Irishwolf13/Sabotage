import React, { useEffect, useState } from 'react';
import { IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { toggleBooleanField } from '../../firebase/controller';

const AlarmDetonated: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const history = useHistory();
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);

  useEffect(() => {
  if (!game || !game.alarmDetonated) return;

  if (user && user.email) {
    const player = game.players.find(p => p.email === user.email);
    if (player && !player.ghost) {
      setShowModal(true);
      setCountdown(3);

      const interval = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }
}, [game, user]);

  useEffect(() => {
    frank()
  }, [countdown, game?.id, history]);

  const frank = async () => {
    if (countdown === 0 && game?.id) {
      setShowModal(false);
      await toggleBooleanField(game.id, "alarmDetonated", true)
      const redirectPath = `/game/${game?.id}/endGame`;
      history.push(redirectPath);
    }
  }

  return (
    <IonModal isOpen={showModal} backdropDismiss={false}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>{countdown}</h2>
        <h1>BOOM!</h1>
      </div>
    </IonModal>
  );
};

export default AlarmDetonated;
