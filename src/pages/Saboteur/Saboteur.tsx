import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonModal } from '@ionic/react';
import './Saboteur.css';
import { useAuth } from '../../firebase/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { getInnocentBaseColors, listenForGameChanges } from '../../firebase/controller';
import { setGames } from '../../stores/gameSlice';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';
import Scanner from '../../components/Scanner/Scanner';

import { useHistory } from 'react-router-dom';

const Saboteur: React.FC = () => {
  const game = useSelector((state: RootState) => state.games[0]);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const history = useHistory();

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);

  useEffect(() => {
    if (game?.id) {
      const unsubscribe = listenForGameChanges(game.id, async (data) => {
        if (user) {
          const innocentColors = await getInnocentBaseColors();

          // Select a random color from the innocentColors array
          let fankeColor = '';
          if (innocentColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * innocentColors.length);
            fankeColor = innocentColors[randomIndex];
          }

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
                color: fankeColor,
                isSaboteur: true,
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

  const handleSolvePuzzleButton = () => {
    setShowScannerModal(false)
    history.push(`/game/${game.id}/puzzles`);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Saboteur</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50%' }}>
          <h1>Saboteur Splash</h1>
          <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
          <IonButton className='halfWidthButton' onClick={handleScannerButtonClicked}>Scanner</IonButton>
          <IonButton className='halfWidthButton' onClick={handleColorButtonClicked}>Sabotage</IonButton>
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
              <Scanner name='test' handleSolvePuzzleButton={handleSolvePuzzleButton}/>
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
              <div
                style={{
                  backgroundColor: game?.color
                    ? `rgb(${extractRGB(game.color).join(',')})`
                    : 'transparent', // Fallback color
                  width: '100px',
                  height: '100px',
                  margin: '0 auto',
                }}
              ></div>
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

export default Saboteur;
