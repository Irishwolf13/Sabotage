import React, { useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Splash.css';
import { useAuth } from '../../firebase/AuthContext';

const Splash: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();

  const navigateToLogin = () => {
    history.push('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Splash Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
          <div style={{ textAlign: 'center', marginTop: '50%' }}>
            <h1>Hello!</h1>
            <IonButton expand="full" onClick={navigateToLogin}>
              Login / Sign Up
            </IonButton>
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

export default Splash;
