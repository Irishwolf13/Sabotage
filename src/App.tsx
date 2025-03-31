// App.tsx

import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import { AuthProvider } from './firebase/AuthContext';
import PrivateRoute from './firebase/PrivateRoute';
import { Provider } from 'react-redux'; // Import Provider from react-redux
import store from './stores/store'; // Import the configured Redux store

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import Home from './pages/Home/Home';
import Splash from './pages/Splash/Splash';
import Login from './pages/Login/Login';
import Lobby from './pages/CreatorLobby/CreatorLobby';
import JoinLobby from './pages/JoinLobby/JoinLobby';
import Innocent from './pages/Innocent/Innocent';
import Saboteur from './pages/Saboteur/Saboteur';
import VotingLobby from './pages/VotingLobby/VotingLobby';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <Provider store={store}>
      <AuthProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <PrivateRoute exact path="/home" component={Home} />
            <PrivateRoute exact path="/game/:uuid" component={Lobby} />
            <PrivateRoute exact path="/game/:uuid/player/1" component={Innocent} />
            <PrivateRoute exact path="/game/:uuid/player/l" component={Saboteur} />
            <PrivateRoute exact path="/game/:uuid/player/votinglobby" component={VotingLobby} />
            <PrivateRoute exact path="/game/:uuid/join" component={JoinLobby} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/" component={Splash} />
          </IonRouterOutlet>
        </IonReactRouter>
      </AuthProvider>
    </Provider>
  </IonApp>
);

export default App;
