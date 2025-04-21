import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonModal, IonToast} from '@ionic/react';
import { listenForGameChanges, updateRoomSabotageStatus } from '../../firebase/controller';
import { useAuth } from '../../firebase/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { setGames } from '../../stores/gameSlice';
import { useHistory } from 'react-router';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';
import Scanner from '../../components/Scanner/Scanner';
import ControlPanel from '../../components/Modals/ControlPanel';
import InnocentPanel from '../../components/Modals/InnocentPanel';
import './MainGamePage.css';

const MainGamePage: React.FC = () => {
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);
  const dispatch = useDispatch();
  const history = useHistory();

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSabotageModal, setShowSabotageModal] = useState(false);
  const [showInnocentModal, setShowInnocentModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  const currentPlayer = game.players.find( (player: any) => player.email === user?.email );

  useEffect(() => {
    if (game?.id && user) {
      const unsubscribe = listenForGameChanges(game.id, (data) => {
        console.log(data)
        const currentPlayer = data.players.find((player: any) => player.email === user.email);

        if (currentPlayer) {
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

  // This is used to make sure all the modals are closed when being sent to dead player page
  useEffect(() => {
    if (game.foundDead) {
      if (user && user.email) { 
        // Check if the player exists and their ghost status is false
        const player = game.players.find(p => p.email === user.email);
        if (player && !player.ghost) {
          setShowScannerModal(false);
          setShowSabotageModal(false);
          setShowInnocentModal(false);
        }
      }
    }
  }, [game]);

  const handleScannerButtonClicked = () => setShowScannerModal(true);
  const handleCloseScannerModal = () => setShowScannerModal(false);

  const handleSabotageButtonClicked = () => setShowSabotageModal(true);
  const handleCloseSabotageModal = () => setShowSabotageModal(false);

  const handleInnocentButtonClicked = () => setShowInnocentModal(true);
  const handleCloseInnocentModal = () => setShowInnocentModal(false);

  const handleSolvePuzzleButton = (puzzleNumber:number) => {
    setShowScannerModal(false);
    history.push(`/game/${game.id}/puzzle${puzzleNumber}`);
  };

  return (
    <IonPage>
      {/* <IonHeader>
        <IonToolbar>
          <IonTitle>{currentPlayer?.isSaboteur ? 'Saboteur' : 'Innocent'}</IonTitle>
        </IonToolbar>
      </IonHeader> */}
      <IonContent fullscreen className="ion-padding">
        <div className='mainPageButtonHolder'>
          <img src="https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2FsabotageSign1Small.png?alt=media&token=9767345f-152f-4bb3-9071-3342708a254e" alt="Description of Image" className="responsive-image" />
          <div>
            {currentPlayer?.isSaboteur ? (
              <>
                <IonButton className='mainPageYellowButton' onClick={handleScannerButtonClicked}>Scanner</IonButton>
                <IonButton className='mainPageBlueButton' onClick={handleSabotageButtonClicked}>Check Stats</IonButton>
              </>
            ) : (
              <>
                <IonButton className='mainPageYellowButton' onClick={handleScannerButtonClicked}>Scanner</IonButton>
                <IonButton className='mainPageBlueButton' onClick={handleInnocentButtonClicked}>Check Stats</IonButton>
              </>
            )}
          </div>
        </div>

        <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
        <IonModal isOpen={showScannerModal} onDidDismiss={handleCloseScannerModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Scanner Modal</IonTitle>
              <IonButton slot="end" onClick={handleCloseScannerModal}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {currentPlayer && <Scanner handleSolvePuzzleButton={handleSolvePuzzleButton} />}
          </IonContent>
        </IonModal>

        <IonModal isOpen={showSabotageModal} onDidDismiss={handleCloseSabotageModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Sabotage Modal</IonTitle>
              <IonButton slot="end" onClick={handleCloseSabotageModal}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {/* This needs work, because we now have availableRooms on the backend */}
            <ControlPanel gameId={game?.id} />
          </IonContent>
        </IonModal>

        <IonModal isOpen={showInnocentModal} onDidDismiss={handleCloseInnocentModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Innocent Modal</IonTitle>
              <IonButton slot="end" onClick={handleCloseInnocentModal}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <InnocentPanel gameId={game?.id} />
          </IonContent>
        </IonModal>

        {/* IonToast Component */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="warning"
        />

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
