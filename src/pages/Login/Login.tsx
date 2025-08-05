import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { createPlayerAccount, checkFirebasePlayerNames } from '../../firebase/controller';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonPage, IonTitle, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonLoading, useIonViewWillEnter } from '@ionic/react';
import { FirebaseError } from 'firebase/app';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const history = useHistory();
  const [showLoading, setShowLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useIonViewWillEnter(() => {
    setAuthSuccess(false);
  });

  useEffect(() => {
    if (authSuccess) {
      history.push('/home');
    }
  }, [authSuccess, history]);

  // Clear error message when user types in email
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(null); // Reset error message when user starts typing in email
    }
  }, [email]);

  const handleLogin = async (event: React.FormEvent) => {
  event.preventDefault();
  setShowLoading(true);

  try {
    if (isSignUp) {
      const checkUniquePlayerName = await checkFirebasePlayerNames(playerName);
      console.log(checkUniquePlayerName);
      
      if (checkUniquePlayerName) { // Adjusted condition
        setErrorMessage('This player name is already taken. Please choose another one.');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User registered successfully');

        const user = userCredential.user;
        await createPlayerAccount(user.uid, email, playerName);

        setEmail('');
        setPassword('');
        setPlayerName('');
        setAuthSuccess(true);
      }
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully');

      setEmail('');
      setPassword('');
      setAuthSuccess(true);
    }

  } catch (err) {
    if (err instanceof FirebaseError) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('The email address is already in use by another account.');
      } else {
        setErrorMessage(isSignUp ? 'Sign-up failed. Please check your inputs.' : 'Login failed. Please check your credentials.');
      }
    } else {
      setErrorMessage('An unexpected error occurred. Please try again later.');
    }
    console.error("Authentication error:", err);
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
            {errorMessage && (
              <p style={{ color: 'red', margin: '10px 0' }}>{errorMessage}</p>
            )}
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
