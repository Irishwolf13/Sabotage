import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { createPlayerAccount } from '../../firebase/controller';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonLoading,
  useIonViewWillEnter
} from '@ionic/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const history = useHistory();
  const [showLoading, setShowLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  useIonViewWillEnter(() => {
    setAuthSuccess(false);
  });

  useEffect(() => {
    if (authSuccess) {
      history.push('/home');
    }
  }, [authSuccess, history]);

  useEffect(() => {
    // HERE
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User registered successfully');

        const user = userCredential.user;
        await createPlayerAccount(user.uid, email, playerName);

        setEmail('');
        setPassword('');
        setPlayerName('');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully');

        setEmail('');
        setPassword('');
      }

      setAuthSuccess(true);
    } catch (err) {
      alert(isSignUp ? 'Sign-up failed. Please check your inputs.' : 'Login failed. Please check your credentials.');
    } finally {
      setShowLoading(false);
    }
  };

  const goToSplash = () => {
    history.push('/');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isSignUp ? 'Sign Up' : 'Login'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={goToSplash}>Back</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonLoading
          isOpen={showLoading}
          message={isSignUp ? "Creating account..." : "Logging in..."}
          duration={0}
        />
        <div className="login-container" style={{ padding: '16px' }}>
          <IonSegment value={isSignUp ? 'signup' : 'login'} onIonChange={(e) => setIsSignUp(e.detail.value === 'signup')}>
            <IonSegmentButton value="login">
              <IonLabel>Login</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="signup">
              <IonLabel>Sign Up</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          <h2>{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h2>
          <form onSubmit={handleLogin}>
            {isSignUp && (
              <IonItem>
                <IonInput
                  type="text"
                  value={playerName}
                  onIonInput={(e) => setPlayerName(e.detail.value!)}
                  required={isSignUp}
                  label="Player Name"
                  labelPlacement="floating"
                  placeholder="Enter Player Name"
                />
              </IonItem>
            )}
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
              {isSignUp ? 'Sign Up' : 'Login'}
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
