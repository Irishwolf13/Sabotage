import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/react';
import './Innocent.css';
import { useAuth } from '../../firebase/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges } from '../../firebase/controller';
import { setGames } from '../../stores/gameSlice';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';
import Scanner from '../../components/Scanner/Scanner';

const Innocent: React.FC = () => {
  const game = useSelector((state: RootState) => state.games[0]);
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);

  useEffect(() => {
    if (game?.id) {
      const unsubscribe = listenForGameChanges(game.id, (data) => {
        if (user) {
          const innocentUser = data.roles.innocents.find(
            (innocent: any) => innocent.email === user.email
          );
          const innocentColor = innocentUser ? innocentUser.color : '';

          dispatch(
            setGames([
              {
                id: game.id,
                name: data.gameName,
                code: data.gameCode,
                players: data.players,
                isEnded: data.isEnded,
                isStarted: data.isStarted,
                foundDead: data.foundDead,
                color: innocentColor,
              },
            ])
          );
        }
      });
      return () => unsubscribe();
    }
  }, [dispatch, game?.id, user?.email]);

  // Closes all Modals if Dead player is Found by anyone
  useEffect(() => {
    if (game.foundDead) {
      setShowColorModal(false)
      setShowScannerModal(false)
    }
  }, [game]);

  const handleColorButtonClicked = () => {
    console.log(game.color);
    setShowColorModal(true);
  };

  const handleScannerButtonClicked = () => {
    setShowScannerModal(true);
  };

  const handleCloseScannerModal = () => {
    setShowScannerModal(false); 
  };

  const handleCloseColorModal = () => {
    setShowColorModal(false);
  };
  
  // Extracts numbers and converts them to integers
  const extractRGB = (colorString: any) => {
    return colorString.match(/\d+/g).map(Number);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Innocent</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50%' }}>
          <h1>Innocent Splash</h1>
          <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
          <IonButton className='fullWidthButton' onClick={handleScannerButtonClicked}>Scanner</IonButton>
          {/* <IonButton onClick={handleColorButtonClicked}>Check Color</IonButton> */}
        </div>

        {/* Scanner Modal implementation */}
        <IonModal isOpen={showScannerModal} onDidDismiss={handleCloseScannerModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Scanner Modal</IonTitle>
              <IonButton slot="end" onClick={handleCloseScannerModal}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ textAlign: 'center' }}>
                  Your Color                   
                  <div style={{
                    backgroundColor: game?.color
                    ? `rgb(${extractRGB(game.color).join(',')})`
                    : 'transparent', // Fallback color
                    width: '100px',
                    height: '20px',
                    margin: '0 auto',
                  }}
                  ></div></IonCardTitle>
                <IonCardSubtitle>

                </IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>Scan Room QR: See available puzzles.<br></br> Scan Dead Player QR: Call for a vote.</IonCardContent>
            </IonCard>
            <Scanner name={game.color} />
          </IonContent>
        </IonModal>

        {/* Color Modal implementation */}
        <IonModal isOpen={showColorModal} onDidDismiss={handleCloseColorModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Color Information</IonTitle>
              <IonButton slot="end" onClick={handleCloseColorModal}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>

          </IonContent>
        </IonModal>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle size="small">© 2025 Dancing Goat Studios</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Innocent;
