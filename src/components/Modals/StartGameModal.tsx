import React, { useEffect, useState } from 'react';
import { IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import './StartGameModal.css'

interface StartGameModalProps {
  isStarted: boolean;
  currentGameId?: string;
}

const StartGameModal: React.FC<StartGameModalProps> = ({ isStarted, currentGameId }) => {
  useGameSubscription();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showSaboteurStatus, setShowSaboteurStatus] = useState<boolean>(false);
  const history = useHistory();
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isStarted) {
      findPlayerType()
      setShowModal(true);
      setCountdown(150);

      interval = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isStarted]);

  useEffect(() => {
      if (countdown === 0 && currentGameId) {
      setShowModal(false);
      const redirectPath = `/game/${currentGameId}/player/mainPage`;
      history.push(redirectPath);
    }
  }, [countdown, currentGameId, history]);

  const findPlayerType = () => {
    if (user && user.email && game) {
      const player = game.players.find(p => p.email === user.email);
      if (player) {
        setShowSaboteurStatus(player.isSaboteur);
      }
    }
    return null;
  }

  return (
    <IonModal isOpen={showModal} backdropDismiss={false}>
      <div className='startGameModal'>
      {showSaboteurStatus && 
          <div>
            <h1>You are the Saboteur!</h1>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2FsabotageSign1Small.png?alt=media&token=9767345f-152f-4bb3-9071-3342708a254e"
              alt="Description of Image"
              className="responsive-image"
            />
          </div>
        }
        {!showSaboteurStatus && 
          <div>
            <h1>You are an Detective.</h1>
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2FmainSplashWithTitleSmall.jpg?alt=media&token=90d974bb-5c74-4a1d-bf9e-a9a5c2069f9c" 
              alt="Description of Image"
              className="responsive-image2"
            />
          </div>
        }
        <h2>{countdown}</h2>
      </div>
    </IonModal>
  );
};

export default StartGameModal;
