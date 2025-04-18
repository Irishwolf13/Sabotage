import React, { useEffect, useState } from 'react';
import { getAvailableRooms } from '../../firebase/controller';
import { IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import './ControlPanel.css'; // Import CSS file

interface RoomStatus {
  room: number;
  canUse: boolean;
  isSabotaged: boolean;
  code: number;
}

const ControlPanel: React.FC<{ gameId: string }> = ({ gameId }) => {
  const [roomsStatus, setRoomsStatus] = useState<RoomStatus[]>([]);
  const [code, setCode] = useState<string>('');

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

  const handleKeypadClick = (value: string) => {
    if (code.length < 4) {
      setCode(prevCode => prevCode + value);
    }
  };

  const clearCode = () => {
    setCode('');
  };
  
  const activateCode = () => {
    console.log(code);
  };

  const deleteLastCharacter = () => {
    if (code.length > 0) {
      setCode(prevCode => prevCode.slice(0, -1));
    }
  };

  const displayRoomStatus = () => (
    <IonList>
      {roomsStatus
        .filter((room) => room.canUse)
        .map((room) => (
          <IonItem key={room.room}>
            <IonLabel>
              Room {room.room} Code : <span style={{ fontWeight: 'bold' }}>{room?.code}</span>
            </IonLabel>
          </IonItem>
        ))}
    </IonList>
  );

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
        <IonButton color="primary" onClick={activateCode}>Activate</IonButton>
      </div>
    </>
  );

  return (
    <div className="control-panel">
      {displayKeyPad()}
      <IonList inset={true} >
        {displayRoomStatus()}
      </IonList>
    </div>
  );
};

export default ControlPanel;
