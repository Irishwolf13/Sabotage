import React from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter } from '@ionic/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import './EndGameVotedOff.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';

const EndOfGameVotedOff: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const game = useSelector((state: RootState) => state.games[0]); 
  
  const navigateToHome = () => {
    // There might be a more graceful way of doing this, but it's not working for me, for now... this works.
    window.location.href = '/home';
  };

  // const testButton = () => {
  //   console.log(game)
  // }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>End Of Game Lobby</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <h1>The Tribe has Spoken!</h1>
        <h1>You have been eliminated!</h1>
        {/* <IonButton onClick={testButton}>Test</IonButton> */}
        <IonButton expand="full" onClick={navigateToHome}>
          Exit Game
        </IonButton>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle size="small">© 2025 Dancing Goat Studios</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default EndOfGameVotedOff;
