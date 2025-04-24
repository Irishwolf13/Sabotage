import React, { useEffect, useState } from 'react';
import {
  IonContent, IonFooter, IonPage, IonTitle,
  IonToolbar
} from '@ionic/react';
import './Home.css';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import NewGameButton from '../../components/Buttons/NewGameButton';
import JoinGameButton from '../../components/Buttons/JoinGameButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const Home: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
    }
  }, []);

  useEffect(() => {
    // Simulating load time for demonstration
    const image = new Image();
    image.src = "https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2FmainSplashWithTitleSmall.jpg?alt=media&token=90d974bb-5c74-4a1d-bf9e-a9a5c2069f9c";
    
    image.onload = () => {
      setIsPageLoading(false);
    };

    image.onerror = () => {
      setIsPageLoading(false);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isPageLoading) {
    return <LoadingSpinner />;
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className='homePagebuttonHolder'>
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/gameArt%2FmainSplashWithTitleSmall.jpg?alt=media&token=90d974bb-5c74-4a1d-bf9e-a9a5c2069f9c" 
            alt="Description of Image" 
            className="homePage-image"
          />
          <NewGameButton />
          <br />
          <JoinGameButton />
        <p className='betaNote'>Alpha Note: Please make sure your phone remains ON and ACTIVE for the ENTIRE game.  Do not let it go to SLEEP or switch out of the app</p>
        </div>
      </IonContent>
      
      <IonFooter>
        <IonToolbar>
          <IonTitle size="small">v.0.1.6 © 2025 Dancing Goat Studios</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Home;