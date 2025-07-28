import React, { useEffect, useState } from 'react';
import { IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';

const FoundBodyModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const history = useHistory();
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);

  useEffect(() => {
  if (!game || !game.foundDead) return;

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
      if (countdown === 0 && game?.id) {
      setShowModal(false);
      const redirectPath = `/game/${game?.id}/player/votinglobby`;
      history.push(redirectPath);
    }
  }, [countdown, game?.id, history]);

  return (
    <IonModal isOpen={showModal} backdropDismiss={false}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>{countdown}</h2>
      </div>
    </IonModal>
  );
};

export default FoundBodyModal;
