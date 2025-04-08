import React, { useEffect } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFooter,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './DeadPlayer.css'; // Ensure your CSS file path is correct
import { useAuth } from '../../firebase/AuthContext';

const DeadPlayer: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();

  useEffect(() => {}, []);

  const myButton = () => {
    window.location.href = '/home';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>DeadPlayer Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {/* Display an HTML image */}
        <IonButton expand="full" onClick={myButton}>
          Use this to exit for now
        </IonButton>
        <h1>You have died!</h1>
        <h5>When another player finds you, they scan this to call a meeting.</h5>
        <img 
          src="https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/barcodes%2FDead%20Body%20Found.jpeg?alt=media&token=1be3e915-5db2-4abc-9f8f-1efccad326db" 
          alt="Dead Player QR Code" 
          style={{ width: '100%', height: 'auto', marginBottom: '20px' }}
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

export default DeadPlayer;


// 