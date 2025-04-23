import React, { useEffect, useState } from 'react';
import { getAvailableRooms, updateRoomSabotageStatus } from '../../firebase/controller';
import { IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import './ControlPanel.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { useGameSubscription } from '../../components/hooks/useGameSubscription';

interface RoomStatus {
  room: number;
  canUse: boolean;
  isSabotaged: boolean;
  code: number;
}

const ControlPanel: React.FC<{ gameId: string }> = ({ gameId }) => {
  useGameSubscription();
  const [roomsStatus, setRoomsStatus] = useState<RoomStatus[]>([]);
  const [code, setCode] = useState<string>('');
  const [showKeypad, setShowKeypad] = useState<boolean>(true); // Default to true to show keypad first
  const [showPlayerPaths, setShowPlayerPaths] = useState<boolean>(false);
  const game = useSelector((state: RootState) => state.games?.[0]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRoomsStatus = async () => {
      try {
        const rooms = await getAvailableRooms(gameId);
        setRoomsStatus(rooms);
      } catch (error) {
        console.error("Error fetching available rooms:", error);
      }
    };

    fetchRoomsStatus();
  }, [gameId]);

  useEffect(() => {
    if (game?.isPlayerDead) {
      setRoomsStatus((prevStatus) =>
        prevStatus.map((room) => ({
          ...room,
          isSabotaged: false,
        }))
      );
    }
  }, [game?.isPlayerDead]);

  const handleKeypadClick = (value: string) => {
    if (code.length < 4) {
      setCode(prevCode => prevCode + value);
    }
  };

  const clearCode = () => {
    setCode('');
  };
  
  const activateCode = async () => {
    if (game?.isPlayerDead) {
      console.log("Cannot activate sabotage while a player is dead.");
      return;
    }

    const enteredCode = parseInt(code, 10);
    const matchedRoom = roomsStatus.find((room) => room.code === enteredCode);
  
    if (matchedRoom) {
      setRoomsStatus((prevStatus) =>
        prevStatus.map((room) => ({
          ...room,
          isSabotaged: room.room === matchedRoom.room,
        }))
      );
  
      try {
        await updateRoomSabotageStatus(gameId, matchedRoom.room);
        console.log(`Activated sabotage mode for room ${matchedRoom.room}.`);
      } catch (error) {
        console.error("Error updating room sabotage status:", error);
      }
    } else {
      console.log("Invalid code entered.");
    }
  
    clearCode();
  };

  const deleteLastCharacter = () => {
    if (code.length > 0) {
      setCode(prevCode => prevCode.slice(0, -1));
    }
  };

  const displayRoomStatus = () => {
    const usableRooms = roomsStatus.filter((room) => room.canUse);
  
    if (usableRooms.length === 0) {
      return (
        <IonItem>
          <IonLabel style={{ textAlign: 'center', width: '100%', fontWeight: 'bold' }}>
            Scan Room QRs to get activation Codes
          </IonLabel>
        </IonItem>
      );
    }
  
    return (
      <div>
        {usableRooms.map((room) => (
          <div className='roomStatusBar' key={room.room}>
            <span>Room {room.room}</span>
            <span style={{ fontWeight: 'bold' }}> Code: {room?.code}</span>
            <span className='spanText'>{room.isSabotaged ? 'Sabotaged' : ''}</span>
          </div>
        ))}
      </div>
    );
  };

  const displayKeyPad = () => (
    <>
      <IonButton className='numbPadYellow' onClick={() => { setShowPlayerPaths(true); setShowKeypad(false); }}>Show Player Paths</IonButton>
      <div className="code-display">
        {code || 'Enter Code'}
      </div>
      <div className='keypadContainer'>
        <div className="keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <IonButton className='numbPadYellow' key={num} onClick={() => handleKeypadClick(num.toString())}>
              {num}
            </IonButton>
          ))}
          <IonButton className='numbPadYellow' style={{ gridColumn: "2" }} onClick={() => handleKeypadClick('0')}>0</IonButton>
          <IonButton className='numbPadBlue' style={{ gridColumn: "3" }} onClick={deleteLastCharacter}>X</IonButton>
        </div>
        <div className="button-group">
          <IonButton className='numbPadBlue' onClick={clearCode}>Clear</IonButton>
          <IonButton className='numbPadRed' disabled={game?.isPlayerDead} onClick={activateCode}>Sabotage</IonButton>
        </div>
      </div>
    </>
  );

  const displayPlayerPaths = () => (
    <div className='player-paths'>
      <IonButton className='controlPanelButton' onClick={() => { setShowPlayerPaths(false); setShowKeypad(true); }}>Close Player Paths</IonButton>
    </div>
  );

  return (
    <div className="control-panel">
      {showKeypad && displayKeyPad()}
      {showPlayerPaths && displayPlayerPaths()}

      {!game?.isPlayerDead && showKeypad && (
        <div className='listContainer'>
          {displayRoomStatus()}
        </div>
      )}
      {game?.isPlayerDead && showKeypad && (
        <div className='warningDiv'>You have already successfully Sabotaged a player this round.</div>
      )}
    </div>
  );
};

export default ControlPanel;
