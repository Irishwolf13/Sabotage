import React from 'react';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signOut } from 'firebase/auth'; // Import signOut
import { auth } from '../../firebase/config'; // Import the auth object from your config
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory(); // Initialize useHistory for navigation

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      history.push('/login'); // Redirect to login page after signing out
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
          <IonTitle>Home</IonTitle>
          <IonButtons slot="end">
            {/* Add a Logout button */}
            <IonButton onClick={handleLogout}>Logout</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* Content of the Home Page */}
      </IonContent>
    </IonPage>
  );
};

export default Home;
