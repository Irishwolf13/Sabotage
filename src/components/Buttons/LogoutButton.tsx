import React from 'react';
import { IonButton } from '@ionic/react';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

const LogoutButton: React.FC = () => {
  return (
    <div>
      <IonButton className='blueButton' onClick={handleLogout} >
        Log Out
      </IonButton>
    </div>
  );
};

export default LogoutButton;