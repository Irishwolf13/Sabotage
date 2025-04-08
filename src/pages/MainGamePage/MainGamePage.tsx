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
  IonToast
} from '@ionic/react';
import './MainGamePage.css';
import { useAuth } from '../../firebase/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { listenForGameChanges, updateRoomSabotageStatus, subscribeToRoomPuzzleStatus } from '../../firebase/controller';
import { setGames, updateAttribute } from '../../stores/gameSlice';
import FoundBodyModal from '../../components/Modals/FoundBodyModal';
import Scanner from '../../components/Scanner/Scanner';
import { useHistory } from 'react-router';

const MainGamePage: React.FC = () => {
  interface RoomStatus {
    room: number;
    sabotaged: boolean;
  }

  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);
  const dispatch = useDispatch();
  const history = useHistory();

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSabotageModal, setShowSabotageModal] = useState(false);
  const [showInnocentModal, setShowInnocentModal] = useState(false);
  const [showRoomStatus, setShowRoomStatus] = useState<RoomStatus[]>([]);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  const currentUserPlayer = game.players.find(
    (player: any) => player.email === user?.email
  );

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

  useEffect(() => {
    if (game?.id) {
      const unsubscribe = subscribeToRoomPuzzleStatus(game.id, (status) => {
        setShowRoomStatus(status);
      });
      return () => unsubscribe();
    }
  }, [game?.id]);

  // This is used to make sure all the modals are closed when being sent to dead player page
  useEffect(() => {
    if (game.foundDead) {
      if (user && user.email) { 
        // Check if the player exists and their ghost status is false
        const player = game.players.find(p => p.email === user.email);
        if (player && !player.ghost) {
          console.log("game info after foundDead");
          console.log(game);
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

  const handleSolvePuzzleButton = () => {
    setShowScannerModal(false);
    history.push(`/game/${game.id}/puzzles`);
  };

  const handleChangeSabotageStatus = (room: number) => {
    const currentRoomStatus = showRoomStatus.find(status => status.room === room);
  
    if (currentRoomStatus?.sabotaged) {
      updateRoomSabotageStatus(game.id, room);
    } else {
      const anotherRoomSabotaged = showRoomStatus.some(status => status.sabotaged);
  
      if (!anotherRoomSabotaged) {
        updateRoomSabotageStatus(game.id, room);
      } else {
        setToastMessage('Only one room can be sabotaged at a time.');
        setShowToast(true);
      }
    }
  };

  // const testButton = async () => {
  //   console.log(game.currentRoom);
  // };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{currentUserPlayer?.isSaboteur ? 'Saboteur' : 'Innocent'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50%' }}>
          <h1>Splash</h1>
          {/* <IonButton onClick={testButton}>Test Button</IonButton> */}
          <FoundBodyModal foundDead={!!game?.foundDead} currentGameId={game?.id} />
          {currentUserPlayer?.isSaboteur ? (
            <>
              <IonButton className='halfWidthButton' onClick={handleScannerButtonClicked}>Scanner</IonButton>
              <IonButton className='halfWidthButton' onClick={handleSabotageButtonClicked}>Check Stats</IonButton>
            </>
          ) : (
            <>
              <IonButton className='halfWidthButton' onClick={handleScannerButtonClicked}>Scanner</IonButton>
              <IonButton className='halfWidthButton' onClick={handleInnocentButtonClicked}>Check Stats</IonButton>
            </>
          )}
        </div>

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

        <IonModal isOpen={showSabotageModal} onDidDismiss={handleCloseSabotageModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Sabotage Modal</IonTitle>
              <IonButton slot="end" onClick={handleCloseSabotageModal}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {showRoomStatus.map((status, index) => (
              <div key={index}>
                Room: {status.room}, Sabotaged: 
                <IonButton
                  onClick={() => handleChangeSabotageStatus(status.room)}
                  style={{ marginLeft: '10px' }}
                >
                  {status.sabotaged ? 'Yes' : 'No'}
                </IonButton>
              </div>
            ))}
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
            Innocent Page
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
