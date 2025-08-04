import React, { useState, useEffect } from 'react';
import {
  IonButton, IonContent, IonHeader, IonPage, IonTitle,
  IonToolbar, IonFooter, IonModal
} from '@ionic/react';
import { evaluateGameStatus, removePlayerFromGame, updateStringField, assignAndUpdatePlayers, createAvailableRooms, toggleBooleanField } from '../../firebase/controller';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';
import { useAuth } from '../../firebase/AuthContext';
import './TallyLobby.css';

const TallyLobby: React.FC = () => {
  useGameSubscription();
  const { user } = useAuth();
  const history = useHistory();
  const game = useSelector((state: RootState) => state.games[0]);
  const livingPlayers = game?.players?.filter(p => !p.ghost) || [];
  const [numSaboteurs, setNumSaboteurs] = useState(1);
  const [showVoterModal, setShowVoterModal] = useState(false);
  const [showTextChanged, setShowTextChanged] = useState('Waiting for all votes to be cast...');

  const assignPlayersEvenly = (numPlayers: number, roomNumbers: number[]) => {
    const numberOfRooms = roomNumbers.length;
    const roomPuzzles: { player: number; order: number; solved: boolean }[][] = Array.from({ length: numberOfRooms }, () => []);
    const playerAssignments = Array.from({ length: numPlayers }, () => new Set<number>());
    const roomCounts = Array(numberOfRooms).fill(0);
    const playerTypeCounter: number[] = Array(numPlayers).fill(0);

    for (let player = 0; player < numPlayers; player++) {
      while (playerAssignments[player].size < 3) {
        const thresholds = [...new Set(roomCounts)].sort((a, b) => a - b);
        let assigned = false;

        for (const threshold of thresholds) {
          const candidates = roomCounts
            .map((count, index) => ({ count, index }))
            .filter(r => r.count === threshold && !playerAssignments[player].has(r.index))
            .map(r => r.index);

          if (candidates.length > 0) {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const roomIdx = candidates[randomIndex];
            const room = roomNumbers[roomIdx];
            playerAssignments[player].add(room);

            roomPuzzles[roomIdx].push({
              player,
              order: playerTypeCounter[player]++,
              solved: false,
            });

            roomCounts[roomIdx]++;
            assigned = true;
            break;
          }
        }

        if (!assigned) throw new Error(`Unable to assign player ${player + 1} a third room`);
      }
    }

    const playerResults: { room: number; order: number; solved: boolean }[][] = Array.from({ length: numPlayers }, () => []);
    for (let roomIndex = 0; roomIndex < roomPuzzles.length; roomIndex++) {
      for (const { player, order, solved } of roomPuzzles[roomIndex]) {
        playerResults[player].push({ room: roomNumbers[roomIndex], order, solved });
      }
    }

    playerResults.forEach(assignments => assignments.sort((a, b) => a.order - b.order));
    return playerResults;
  };

  const handleResetRooms = async () => {
    if (!game?.players) return;
    const roomPuzzles = assignPlayersEvenly(game.players.length - numSaboteurs, [1, 2, 3, 4, 5]);
    await createAvailableRooms(game.id, [1, 2, 3, 4, 5]);
    await assignAndUpdatePlayers(game.id, roomPuzzles);
  };

  const handleVotingComplete = async () => {
    if (!game) return;
    setShowVoterModal(false);
    await handleResetRooms();
    await updateStringField(game.id, 'kickedPlayer', '');

    const playerIsAlive = livingPlayers.some(player => player.email === user?.email);
    if (!playerIsAlive) {
      history.push(`/game/${game.id}/votedOff`);
      return;
    }

    if (game.isEnded) {
      history.push(`/game/${game.id}/endGame`);
    } else {
      history.push(`/game/${game.id}/player/mainPage`);
    }
  };

  const checkVotesAndTally = async () => {
    if (!user || !game?.players || !game.calledMeeting || user.email !== game.calledMeeting || !game.isVoting) return;

    const voters = game.players.filter(player => !player.ghost);
    const allVoted = voters.every(player =>
      player.votes?.some(v => v.gameRound === game.gameRound)
    );

    if (!allVoted) return;

    console.log('All players voted. Tallying...');
    const voteCounts: Record<string, number> = {};

    voters.forEach(player => {
      const vote = player.votes?.find(v => v.gameRound === game.gameRound);
      if (vote?.selected) {
        const weight = player.isSaboteur ? 1.5 : 1;
        voteCounts[vote.selected] = (voteCounts[vote.selected] || 0) + weight;
      }
    });

    const [kickedEmail, _] = Object.entries(voteCounts).reduce(
      (max, current) => current[1] > max[1] ? current : max,
      ['', -Infinity] as [string, number]
    );

    if (kickedEmail) {
      await updateStringField(game.id, 'calledMeeting', '');
      await updateStringField(game.id, 'kickedPlayer', kickedEmail);
      await removePlayerFromGame(game.id, kickedEmail);
      await evaluateGameStatus(game.id);
      await toggleBooleanField(game.id, 'isVoting', false);
    }
  };

  useEffect(() => {
    if (game?.players && game?.isVoting) {
      checkVotesAndTally();
    }
  }, [game?.players]);

  useEffect(() => {
    // When tally is finished (isVoting flips to false), all clients show the modal
    if (game?.isVoting === false && game?.calledMeeting === '' && game?.players) {
      setShowVoterModal(true);
    }
  }, [game?.isVoting]);

  return (
    <IonPage>
      <IonContent>
        <div className='votingPageButtonHolder'>
          <h2 style={{ color: '#301000' }}>{showTextChanged}</h2>
          <IonModal isOpen={showVoterModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Voted Off...</IonTitle>
                <IonButton slot="end" onClick={handleVotingComplete}>Close</IonButton>
              </IonToolbar>
            </IonHeader>
          <IonContent>
            {game?.kickedPlayer
              ? `${game.players.find(p => p.email === game.kickedPlayer)?.screenName || 'A player'} was kicked from the game.`
              : 'Someone was kicked from the game.'}
          </IonContent>
          </IonModal>
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

export default TallyLobby;
