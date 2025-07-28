import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonModal, IonToast} from '@ionic/react';
// import { listenForGameChanges } from '../../firebase/controller';
// import { setGames } from '../../stores/gameSlice';
import { useAuth } from '../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useHistory } from 'react-router';
import Scanner from '../../components/Scanner/Scanner';
import ControlPanel from '../../components/Modals/ControlPanel';
import InnocentPanel from '../../components/Modals/InnocentPanel';
import './MainGamePage.css';

const MainGamePage: React.FC = () => {
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);
  // const dispatch = useDispatch();
  const history = useHistory();

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSabotageModal, setShowSabotageModal] = useState(false);
  const [showInnocentModal, setShowInnocentModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  const currentPlayer = game.players.find( (player: any) => player.email === user?.email );

  // useEffect(() => {
  //   if (game?.id && user) {
  //     const unsubscribe = listenForGameChanges(game.id, (data) => {
  //       // console.log('main Page Data')
  //       // console.log(data)
  //       const currentPlayer = data.players.find((player: any) => player.email === user.email);

  //       if (currentPlayer) {
  //         dispatch(
  //           setGames([
  //             {
  //               ...game,
  //               name: data.gameName,
  //               code: data.gameCode,
  //               players: data.players,
  //               isEnded: data.isEnded,
  //               isStarted: data.isStarted,
  //               foundDead: data.foundDead,
  //             },
  //           ])
  //         );
  //       }
  //     });
  //     return () => unsubscribe();
  //   }
  // }, [dispatch, game?.id, user]);

  // This is used to make sure all the modals are closed when being sent to dead player page
  useEffect(() => {
    if (game.foundDead) {
      if (user && user.email) { 
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

  const handleSolvePuzzleButton = () => {
    setShowScannerModal(false);
    history.push(`/game/${game.id}/puzzlePage`);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className='mainPageButtonHolder'>
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2FsabotageSign1Small.png?alt=media&token=9767345f-152f-4bb3-9071-3342708a254e"
            alt="Sabotage Main Image"
            className="responsive-image"
          />
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

        {/* MODALS BELOW */}

        <IonModal isOpen={showScannerModal} onDidDismiss={handleCloseScannerModal}>
          <div className='modalButtonContainer'>
            <IonButton className='blueButton' slot="end" onClick={handleCloseScannerModal}>Close</IonButton>
          </div>
          <IonContent>
            {currentPlayer && <Scanner handleSolvePuzzleButton={handleSolvePuzzleButton} />}
          </IonContent>
        </IonModal>

        <IonModal isOpen={showSabotageModal} onDidDismiss={handleCloseSabotageModal}>
          <div className='modalButtonContainer'>
              <IonButton className='blueButton' slot="end" onClick={handleCloseSabotageModal}>Close</IonButton>
          </div>
          <IonContent>
            <ControlPanel gameId={game?.id} />
          </IonContent>
        </IonModal>

        <IonModal isOpen={showInnocentModal} onDidDismiss={handleCloseInnocentModal}>
          <div className='modalButtonContainer'>
              <IonButton className='blueButton' slot="end" onClick={handleCloseInnocentModal}>Close</IonButton>
          </div>
          <IonContent>
            <InnocentPanel gameId={game?.id} />
          </IonContent>
        </IonModal>

        {/* IonToast Component */}
        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} color="warning"/>
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
