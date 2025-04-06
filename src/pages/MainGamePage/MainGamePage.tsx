import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/react';
import './MainGamePage.css';
import { useAuth } from '../../firebase/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges } from '../../firebase/controller';
import { setGames } from '../../stores/gameSlice';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';
import Scanner from '../../components/Scanner/Scanner';
import { useHistory } from 'react-router';

const MainGamePage: React.FC = () => {
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);
  const dispatch = useDispatch();
  const history = useHistory();

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSabotageModal, setShowSabotageModal] = useState(false);
  const [showInnocentModal, setShowInnocentModal] = useState(false);

  useEffect(() => {
    if (game?.id && user) {
      const unsubscribe = listenForGameChanges(game.id, (data) => {
        const currentUserPlayer = data.players.find(
          (player: any) => player.email === user.email
        );

        if (currentUserPlayer) {
          dispatch(
            setGames([
              {
                ...game,
                name: data.gameName,
                code: data.gameCode,
                players: data.players,
                isEnded: data.isEnded,
                isStarted: data.isStarted,
                foundDead: data.foundDead,
              },
            ])
          );
        }
      });
      return () => unsubscribe();
    }
  }, [dispatch, game?.id, user]);

  // Closes all Modals if Dead player is Found by anyone
  useEffect(() => {
    if (game.foundDead) {
      setShowScannerModal(false);
      {setShowSabotageModal(false);};
      {setShowInnocentModal(false);};
    }
  }, [game]);

  const handleScannerButtonClicked = () => {setShowScannerModal(true);};
  const handleCloseScannerModal = () => {setShowScannerModal(false);};

  const handleSabotageButtonClicked = () => {setShowSabotageModal(true);};
  const handleCloseSabotageModal = () => {setShowSabotageModal(false);};

  const handleInnocentButtonClicked = () => {setShowInnocentModal(true);};
  const handleCloseInnocentModal = () => {setShowInnocentModal(false);};

  const handleSolvePuzzleButton = () => {
    setShowScannerModal(false);
    history.push(`/game/${game.id}/puzzles`);
  };

  // Find the current user's player details
  const currentUserPlayer = game.players.find(
    (player: any) => player.email === user?.email
  );

  const is = currentUserPlayer && !currentUserPlayer.isSaboteur;

  // const testbutton = () => {
  //   console.log(game.votes)
  // }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {currentUserPlayer?.isSaboteur ? 'Saboteur' : 'Innocent'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50%' }}>
          {/* <IonButton onClick={testbutton}>Test</IonButton> */}
          <h1>Splash</h1>
          <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
          {currentUserPlayer?.isSaboteur &&
            <>
              <IonButton className='halfWidthButton' onClick={handleScannerButtonClicked}>Scanner</IonButton>
              <IonButton className='halfWidthButton' onClick={handleSabotageButtonClicked}>Check Stats</IonButton>
            </>
          }
          {!currentUserPlayer?.isSaboteur && 
            <>
              <IonButton className='halfWidthButton' onClick={handleScannerButtonClicked}>Scanner</IonButton>
              <IonButton className='halfWidthButton' onClick={handleInnocentButtonClicked}>Check Stats</IonButton>
            </>
          }
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
            {currentUserPlayer && <Scanner playerColor={currentUserPlayer.color} handleSolvePuzzleButton={handleSolvePuzzleButton} />}
          </IonContent>
        </IonModal>
        {/* Scanner Modal implementation */}
        <IonModal isOpen={showSabotageModal} onDidDismiss={handleCloseSabotageModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Sabotage Modal</IonTitle>
              <IonButton slot="end" onClick={handleCloseSabotageModal}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            Sabotage Page
          </IonContent>
        </IonModal>
        {/* Scanner Modal implementation */}
        <IonModal isOpen={showInnocentModal} onDidDismiss={handleCloseInnocentModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Innocent Modal</IonTitle>
              <IonButton slot="end" onClick={handleCloseInnocentModal}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            Innocent Page
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

export default MainGamePage;
