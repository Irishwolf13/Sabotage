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
      <IonContent fullscreen className="ion-padding">
        <div className='homePagebuttonHolder'>
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2FmainSplashWithTitleSmall.jpg?alt=media&token=90d974bb-5c74-4a1d-bf9e-a9a5c2069f9c" 
            alt="Description of Image" 
            className="homePage-image" 
          />
          <NewGameButton />
          <br></br>
          <JoinGameButton />
        </div>
          
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonTitle size="small">v.0.1.4 © 2025 Dancing Goat Studios</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Home;
