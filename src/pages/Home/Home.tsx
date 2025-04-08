import React, { useEffect, useState } from 'react';
import {
  IonButtons, IonContent, IonHeader, IonMenuButton,
  IonPage, IonTitle, IonToolbar, IonButton, IonFooter,
} from '@ionic/react';
import './Home.css';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import NewGameButton from '../../components/Buttons/NewGameButton';
import JoinGameButton from '../../components/Buttons/JoinGameButton';

const Home: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{email || "User"}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>Logout</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
      <p>v.0.1.14</p>
        <div style={{ textAlign: 'center', marginTop: '20%' }}>
          <NewGameButton />
          <br></br>
          <JoinGameButton />
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

export default Home;
