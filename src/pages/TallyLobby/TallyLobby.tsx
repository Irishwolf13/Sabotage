import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, IonModal } from '@ionic/react';
import { clearVotes, evaluateVotes, evaluateGameStatus, toggleBooleanField, updateStringField, assignAndUpdatePlayers, createAvailableRooms  } from '../../firebase/controller';
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
  const livingPlayers = game?.players?.filter(player => !player.ghost) || [];
  const [numSaboteurs, setNumSaboteurs] = useState(1);

  const [showVoterModal, setShowVoterModal] = useState(false);
  const [showTextChanged, setShowTextChanged] = useState('Waiting for all votes to be cast...');
  
  const handleResetRooms = async () => {
    if (game.players && game.players.length > 0) {
      const totalPlayers = game.players.length;

      // Frank, this is gonig to be changed eventually, because we want to be albe to adjust rooms
      const roomPuzzles = assignPlayersEvenly(totalPlayers - numSaboteurs, [1,2,3,4,5]);
      await createAvailableRooms(game.id, [1,2,3,4,5])
      await assignAndUpdatePlayers(game.id, roomPuzzles)
    } else {
      console.log('No players available for role assignment.');
    }
  };

  ///////////////////////////////////////////////////////// CODE THAT SHOULD bE LOOKED AT FOR DUPLICATION
  type PlayerRoom = { room: number; order: number; solved: boolean };
  const assignPlayersEvenly = (numberOfPlayers: number, roomNumbers: number[]): PlayerRoom[][] => {
    const numberOfRooms = roomNumbers.length;
    
    const roomPuzzles: { player: number; order: number; solved: boolean }[][] = Array.from(
      { length: numberOfRooms },
      () => []
    );

    const playerAssignments = Array.from(
      { length: numberOfPlayers },
      () => new Set<number>()
    );
    const roomCounts = Array(numberOfRooms).fill(0);
    const playerTypeCounter: number[] = Array(numberOfPlayers).fill(0);

    for (let player = 0; player < numberOfPlayers; player++) {
      while (playerAssignments[player].size < 3) {
        const thresholds = [...new Set(roomCounts)].sort((a, b) => a - b);
        let assigned = false;

        for (const threshold of thresholds) {
          const candidates = roomCounts
            .map((count, index) => ({ count, index }))
            .filter(
              (r) =>
                r.count === threshold && !playerAssignments[player].has(r.index)
            )
            .map((r) => r.index);

          if (candidates.length > 0) {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const roomIdx = candidates[randomIndex];
            const room = roomNumbers[roomIdx]; // Get the actual room number here
            
            playerAssignments[player].add(room);

            roomPuzzles[roomIdx].push({
              player: player,
              order: playerTypeCounter[player]++,
              solved: false,
            });

            roomCounts[roomIdx]++;
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          throw new Error(`Unable to assign player ${player + 1} a third room`);
        }
      }
    }

    // Create final player-specific structure
    const playerResults: PlayerRoom[][] = Array.from(
      { length: numberOfPlayers },
      () => []
    );

    for (let roomIndex = 0; roomIndex < roomPuzzles.length; roomIndex++) {
      for (const { player, order, solved } of roomPuzzles[roomIndex]) {
        playerResults[player].push({
          room: roomNumbers[roomIndex], // Get the actual room number here
          order,
          solved,
        });
      }
    }

    // Sort each player's assignments by type
    for (const assignments of playerResults) {
      assignments.sort((a, b) => a.order - b.order);
    }

    return playerResults;
  };
  ///////////////////////////////////////////////////////// END OF CODE THAT SHOULD bE LOOKED AT FOR DUPLICATION

  const handleVotingComplete = async () => {
    if (game) {
      await clearVotes(game.id);
      if (game.calledMeeting != '') {
        await updateStringField(game.id, 'calledMeeting', '')
        console.log('rooms changing')
        handleResetRooms()
        // Change rooms here
      }
      setShowVoterModal(false);
      const playerIsAlive = livingPlayers.some((player: { email: string }) => player.email === user?.email);
      if (!playerIsAlive) {
        history.push(`/game/${game.id}/votedOff`);
        return;
      }
      if (game.isEnded && !game.saboteurWins) {
        // Detectives wins
        history.push(`/game/${game.id}/endGame`);
      } else if (game.isEnded && game.saboteurWins){
        // Saboteur wins
        history.push(`/game/${game.id}/endGame`);
      } else if (!game.isEnded){
        // Default
        history.push(`/game/${game.id}/player/mainPage`);
      }
    }
  };

  const handleCheckVotesButton = () => {
    setShowVoterModal(true);
  };
  
  useEffect(() => {
    if(user && game.calledMeeting == user.email) {
      if (game.votes && livingPlayers) {
        if (game.votes.length === livingPlayers.length) {
          evaluateVotes(game.id).then(result => {
            if (result) {
              updateStringField(game.id, 'kickedPlayer', result.screenName)
            }
            evaluateGameStatus(game.id)
          });

          // change the backend of allVotesCast
          toggleBooleanField(game.id, 'allVotesCast', true)
        }
      }
    }
  }, [game.votes, livingPlayers]);
  
  useEffect(() => {
    if(game.allVotesCast == true) {
      setShowTextChanged('Tallying all the votes...');

      if (game.allVotesCast) {
        const modalTimer = setTimeout(() => {
          setShowVoterModal(true);
        }, 500);
  
        const textChangeTimer = setTimeout(() => {
          setShowTextChanged('Waiting for all votes to be cast...');
          toggleBooleanField(game.id, 'allVotesCast', false)
        }, 1000);
  
        return () => {
          // change the backend of allVotesCast
          clearTimeout(modalTimer);
          clearTimeout(textChangeTimer);
        };
      }
    }
  }, [game.allVotesCast]);

  // const testButton = async () => {
  //   console.log('info here...')
  //   console.log(game)
  //   console.log(livingPlayers)
  //   console.log('END info here...')
  // }

  return (
    <IonPage>
      <IonContent>
        <div className='votingPageButtonHolder'> 
        {/* <IonButton onClick={testButton}>Test</IonButton> */}
          {/* <IonButton onClick={handleCheckVotesButton}>Test Button</IonButton> */}
          <h2 style={{color:'#301000'}}>{showTextChanged}</h2>
          <br></br>
          <h4 style={{color:'#301000'}}>Players Who have voted:</h4>

          {livingPlayers.map((player, index) => {
            const hasVoted = game.votes && Array.isArray(game.votes) && game.votes.some(vote => vote.voter === player.email);
            return (
              <div className='tallyWhoVoted' key={index}>
                {player.screenName} {hasVoted && 
                  <img src="path/to/your/checkmark.png" 
                    alt="Voted" 
                    style={{ width: '16px', height: '16px' }} 
                  />}
              </div>
            );
          })}

          {/* Scanner Modal implementation */}
          <IonModal isOpen={showVoterModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Voted Off...</IonTitle>
                <IonButton slot='end' onClick={handleVotingComplete}>Close</IonButton>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              {game.kickedPlayer} was kicked!
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
