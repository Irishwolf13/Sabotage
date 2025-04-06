import React, { useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Splash.css';
import { useAuth } from '../../firebase/AuthContext'; // Assuming this provides user info

const Splash: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth(); // Access current user from context

  useEffect(() => {
    // Check if the user is logged in
    if (user) {
      // Redirect to /home if authenticated
      history.push('/home');
    }
  }, [user, history]); // Depend on user and history for reactivity

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
        <h1>Hello!</h1>
        <IonButton expand="full" onClick={navigateToLogin}>
          Login / Sign Up
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

export default Splash;
