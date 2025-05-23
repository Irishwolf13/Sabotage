import React, { useEffect, useState } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import { AuthProvider } from './firebase/AuthContext';
import PrivateRoute from './firebase/PrivateRoute';
import { Provider } from 'react-redux';
import store from './stores/store';

/* Core & Theme CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './App.css';
import './theme/variables.css';

import Home from './pages/Home/Home';
import Splash from './pages/Splash/Splash';
import Login from './pages/Login/Login';
import Lobby from './pages/CreatorLobby/CreatorLobby';
import JoinLobby from './pages/JoinLobby/JoinLobby';
import MainGamePage from './pages/MainGamePage/MainGamePage';
import VotingLobby from './pages/VotingLobby/VotingLobby';
import TallyLobby from './pages/TallyLobby/TallyLobby';
import EndOfGameLobby from './pages/EndOfGameLobby/EndOfGameLobby';
import EndOfGameVotedOff from './pages/EndGameVotedOff/EndGameVotedOff';
import DeadPlayer from './pages/DeadPlayer/DeadPlayer';
import Puzzle1 from './pages/Puzzles/Puzzle1/Puzzle1';
import Puzzle2 from './pages/Puzzles/Puzzle2/Puzzle2';
import Puzzle3 from './pages/Puzzles/Puzzle3/Puzzle3';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    // Prevent Pull-to-Refresh
    const preventPullToRefresh = (event: TouchEvent) => {
      if (window.scrollY === 0) {
        event.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventPullToRefresh, { passive: false });
  
    // Prevent Page Refresh (F5, Cmd+R, Browser Reload)
    const preventRefresh = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // Required for Chrome
    };
    window.addEventListener("beforeunload", preventRefresh);
  
    // Completely Disable Back Button Navigation
    const preventBackNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };
  
    // Set initial history state & force user to stay
    window.history.pushState(null, "", window.location.href);
    window.history.pushState(null, "", window.location.href); // Push twice to block back action
    window.addEventListener("popstate", preventBackNavigation);
  
    return () => {
      document.removeEventListener("touchmove", preventPullToRefresh);
      window.removeEventListener("beforeunload", preventRefresh);
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []);

  return (
    <IonApp>
      <Provider store={store}>
        <AuthProvider>
          <IonReactRouter>
            <IonRouterOutlet>
              <PrivateRoute exact path="/home" component={Home} />
              <PrivateRoute exact path="/game/:uuid" component={Lobby} />
              <PrivateRoute exact path="/game/:uuid/player/mainPage" component={MainGamePage} />
              <PrivateRoute exact path="/game/:uuid/player/votinglobby" component={VotingLobby} />
              <PrivateRoute exact path="/game/:uuid/join" component={JoinLobby} />
              <PrivateRoute exact path="/game/:uuid/puzzle1" component={Puzzle1} />
              <PrivateRoute exact path="/game/:uuid/puzzle2" component={Puzzle2} />
              <PrivateRoute exact path="/game/:uuid/puzzle3" component={Puzzle3} />
              <PrivateRoute exact path="/game/:uuid/tally" component={TallyLobby} />
              <PrivateRoute exact path="/game/:uuid/endGame" component={EndOfGameLobby} />
              <PrivateRoute exact path="/game/:uuid/votedOff" component={EndOfGameVotedOff} />
              <PrivateRoute exact path="/game/:uuid/deadPlayer" component={DeadPlayer} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/" component={Splash} />
            </IonRouterOutlet>
            {/* <FullscreenPrompt /> */}
          </IonReactRouter>
        </AuthProvider>
      </Provider>
    </IonApp>
  );
};

export default App;
