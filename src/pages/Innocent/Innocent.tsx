import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonModal } from '@ionic/react';
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
            },
          ])
        );
      });
      return () => unsubscribe();
    }
  }, [dispatch, game?.id]);

  useEffect(() => {
    if (game) {
      console.log('Current Game Info:', game);
    }
  }, [game]);

  const handleButtonPressed = () => {
    setShowColorModal(true); // Open the color modal
  };

  const handleScannerPressed = () => {
    setShowScannerModal(true); // Open the scanner modal
  }

  const handleCloseScannerModal = () => {
    setShowScannerModal(false); // Close the scanner modal
  }

  const handleCloseColorModal = () => {
    setShowColorModal(false); // Close the color modal
  }

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
          <IonButton onClick={handleScannerPressed}>Scanner</IonButton>
          <IonButton onClick={handleButtonPressed}>Check Color</IonButton>
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
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>Scanner Information</h2>
              <Scanner name='test'/>
            </div>
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
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>Check Color Information</h2>
              <p>Here you can display information or functionality related to checking colors.</p>
            </div>
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
