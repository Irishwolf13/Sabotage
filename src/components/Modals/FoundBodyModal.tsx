import React, { useEffect, useState } from 'react';
import { IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';

interface FoundBodyModalProps {
  foundDead: boolean;
  currentGameId?: string;
}

const FoundBodyModal: React.FC<FoundBodyModalProps> = ({ foundDead, currentGameId }) => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const history = useHistory();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (foundDead) {
      setShowModal(true);
      setCountdown(3);

      interval = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
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
