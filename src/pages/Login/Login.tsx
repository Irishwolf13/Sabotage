import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory
import { auth } from '../../firebase/config'; // Import your Firebase config
import { signInWithEmailAndPassword } from 'firebase/auth';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonPage, IonTitle, IonToolbar, } from '@ionic/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory(); // Initialize useHistory

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully');

      // Clear the form fields before redirecting
      setEmail('');
      setPassword('');

      // Redirect to /home on successful login
      history.push('/home');
    } catch (err) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="login-container" style={{ padding: '16px' }}>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <IonItem>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                required
                label="Email" 
                labelPlacement="floating" 
                placeholder="frank@sabotage.com"
              />
            </IonItem>
            <IonItem>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
                required
                label="Password" 
                labelPlacement="floating" 
                placeholder="********"
              />
            </IonItem>
            <IonButton expand="full" type="submit" style={{ marginTop: '20px' }}>
              Login
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
