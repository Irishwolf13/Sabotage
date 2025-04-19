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

  // Effect to handle isPlayerDead condition
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
      <IonList>
        {usableRooms.map((room) => (
          <IonItem key={room.room}>
            <IonLabel style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                Room {room.room} Code: <span style={{ fontWeight: 'bold' }}>{room?.code}</span>
              </span>
              {room.isSabotaged && <span style={{ color: 'red', fontWeight: 'bold' }}>Sabotaged</span>}
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
    );
  };

  const displayKeyPad = () => (
    <>
      <div className="code-display">
        {code || 'Enter Code'}
      </div>
      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <IonButton key={num} onClick={() => handleKeypadClick(num.toString())}>
            {num}
          </IonButton>
        ))}
        <IonButton style={{ gridColumn: "2" }} onClick={() => handleKeypadClick('0')}>0</IonButton>
        <IonButton color="warning" style={{ gridColumn: "3" }} onClick={deleteLastCharacter}>X</IonButton>
      </div>
      <div className="button-group">
        <IonButton color="danger" onClick={clearCode}>Clear</IonButton>
        <IonButton color="primary" disabled={game?.isPlayerDead} onClick={activateCode}>Activate</IonButton>
      </div>
    </>
  );

  return (
    <div className="control-panel">
      {displayKeyPad()}
      { !game?.isPlayerDead && <IonList inset={true} >
        {displayRoomStatus()}
      </IonList>}
      {game?.isPlayerDead && <div className='warningDiv'>You have already Sabotaged a player this round.</div>}
    </div>
  );
};

export default ControlPanel;
