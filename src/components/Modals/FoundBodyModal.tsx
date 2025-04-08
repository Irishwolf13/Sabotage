import React, { useEffect, useState } from 'react';
import { IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';

interface FoundBodyModalProps {
  foundDead: boolean;
  currentGameId?: string;
}

const FoundBodyModal: React.FC<FoundBodyModalProps> = ({ foundDead, currentGameId }) => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const history = useHistory();
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (foundDead) {
      if (user && user.email) { 
        // Check if the player exists and their ghost status is false
        const player = game.players.find(p => p.email === user.email);
        if (player && !player.ghost) {
          setShowModal(true);
          setCountdown(3);
    
          interval = setInterval(() => {
            setCountdown((prevCount) => prevCount - 1);
          }, 1000);
        }
    
        return () => clearInterval(interval);
      }
    }
  }, [foundDead]);

  useEffect(() => {
      if (countdown === 0 && currentGameId) {
      setShowModal(false);
      const redirectPath = `/game/${currentGameId}/player/votinglobby`;
      // console.log(`Redirecting to: ${redirectPath}`);
      history.push(redirectPath);
    }
  }, [countdown, currentGameId, history]);

  return (
    <IonModal isOpen={showModal} backdropDismiss={false}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>{countdown}</h2>
      </div>
    </IonModal>
  );
};

export default FoundBodyModal;
