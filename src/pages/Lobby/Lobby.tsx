import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter } from '@ionic/react';
import './Lobby.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';

const Lobby: React.FC = () => {
  // Use `useSelector` to access the first game from the Redux store
  const game = useSelector((state: RootState) => state.games[0]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lobby Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '50%' }}>
          <h1>Join Code: <strong>{game.code}</strong></h1>
          {game ? (
            <>
              <p><strong>{game.name}</strong></p>
            </>
          ) : (
            <p>No game available</p>
          )}
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle size="small">© 2025 Dancing Goat Studios</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Lobby;
