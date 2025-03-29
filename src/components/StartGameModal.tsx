import React, { useEffect, useState } from 'react';
import { IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';

interface StartGameModalProps {
  isStarted: boolean;
  currentGameId?: string;
  roleId: string;
}

const StartGameModal: React.FC<StartGameModalProps> = ({ isStarted, currentGameId, roleId }) => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const history = useHistory();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStarted) {
      setShowModal(true);
      setCountdown(3);

      interval = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isStarted]);

  useEffect(() => {
      if (countdown === 0 && currentGameId) {
      setShowModal(false);
      const redirectPath = `/game/${currentGameId}/player/${roleId}`;
      // console.log(`Redirecting to: ${redirectPath}`);
      history.push(redirectPath);
    }
  }, [countdown, currentGameId, roleId, history]);

  return (
    <IonModal isOpen={showModal} backdropDismiss={false}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>{countdown}</h2>
      </div>
    </IonModal>
  );
};

export default StartGameModal;
