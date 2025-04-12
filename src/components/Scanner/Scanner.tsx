import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import './Scanner.css'; // Import your CSS file
import { IonButton, IonCardTitle } from '@ionic/react';
import { getRoomColors, toggleBooleanField, updateStringField, adjustSaboteurAvailableRooms } from '../../firebase/controller';
import { RootState } from '../../stores/store';
import { useDispatch, useSelector } from 'react-redux';
import { updateAttribute } from '../../stores/gameSlice';
import { useAuth } from '../../firebase/AuthContext';

interface ContainerProps {
  playerColor: string;
  handleSolvePuzzleButton: () => void;
}

const Scanner: React.FC<ContainerProps> = ({ playerColor, handleSolvePuzzleButton }) => {
  const [roomColors, setRoomColors] = useState<string[]>([]);
  const [isNameInRoomColors, setIsNameInRoomColors] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(true);
  // const [testText, setTestText] = useState(-1)
  const game = useSelector((state: RootState) => state.games[0]);
  const dispatch = useDispatch();
  const { user } = useAuth(); 

  useEffect(() => {
    if (!showScanner) return;

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
      
      if (decodedText.includes("Room")) {
        const roomNumberString = decodedText.replace("Room ", "");
        const roomNumber = parseInt(roomNumberString);
        if (user && user.email) {
          // Find the player object whose email matches user.email
          const currentPlayer = game.players.find(p => p.email === user.email);
          
          if (currentPlayer) {
            // Check that object's isSaboteur property
            if (currentPlayer.isSaboteur) {
              // If it is true, run this code:
              await adjustSaboteurAvailableRooms(game.id, roomNumber);
            } else {
              // If it is false, run this code:
              dispatch(updateAttribute({ id: game.id, key: 'currentRoom', value: roomNumber }));
              const colors = await getRoomColors(game.id, roomNumber);
              setRoomColors(colors);
            }
          } else {
            console.error('Player not found');
          }
        }
      }
      if (decodedText.includes("Dead")) {
        if (user && user.email) {
          await updateStringField(game.id, 'calledMeeting', user.email)
          await toggleBooleanField(game.id, "foundDead", true);
        } 
      }
      setShowScanner(false);
    };

    const onScanError = (errorMessage: string) => {
      console.error(`QR Code scan error: ${errorMessage}`);
    };

    const config = {
      fps: 10,
      qrbox: 250,
      scanType: Html5QrcodeScanType.SCAN_TYPE_CAMERA,
    };

    const scanner = new Html5QrcodeScanner('qr-reader', config, false);
    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear();
    };
  }, [game.id, showScanner]);

  // Updates whether the name exists in roomColors whenever either changes
  useEffect(() => {
    const checkIfNameInRoomColors = roomColors.some((color) => color.includes(playerColor));
    setIsNameInRoomColors(checkIfNameInRoomColors);
  }, [playerColor, roomColors]);

  // Extracts numbers and converts them to integers
  const extractRGB = (colorString: any) => {
    return colorString.match(/\d+/g).map(Number);
  };

  const testGoToPuzzle = async (room:number) => {
    console.log(game.currentRoom)
    console.log(room)
    try {
      if (user && user.email) {
        // Find the player object whose email matches user.email
        const currentPlayer = game.players.find(p => p.email === user.email);
        
        if (currentPlayer) {
          // Check that object's isSaboteur property
          if (currentPlayer.isSaboteur) {
            // If it is true, run this code:
            await adjustSaboteurAvailableRooms(game.id, room);
          } else {
            // If it is false, run this code:
            dispatch(updateAttribute({ id: game.id, key: 'currentRoom', value: room }));
          }
        } else {
          console.error('Player not found');
        }
        
        // Always run this code:
        handleSolvePuzzleButton();
      }
    } catch (err) {
      console.error('Error entering room:', err);
    }
  };

  const testDeadBody = async () => {
    if (user && user.email) {
      await updateStringField(game.id, 'calledMeeting', user.email)
      await toggleBooleanField(game.id, "foundDead", true);
    }
  }

  return (
    <div  style={{ margin: '10px' }}>
      <IonButton onClick={() => testGoToPuzzle(0)}>Test 0</IonButton>
      <IonButton onClick={() => testGoToPuzzle(1)}>Test 1</IonButton>
      <IonButton onClick={() => testGoToPuzzle(2)}>Test 2</IonButton>
      <IonButton onClick={() => testGoToPuzzle(3)}>Test 3</IonButton>
      <IonButton onClick={() => testGoToPuzzle(4)}>Test 4</IonButton>
      <IonButton onClick={() => testGoToPuzzle(5)}>Test 5</IonButton>
      <div className='colorHolder' >
        <p style={{ marginRight: '10px' }}>Available Puzzles:</p>
        {roomColors.map((color, index) => (
          <div 
          key={index} 
          style={{ 
            backgroundColor: `rgb(${extractRGB(color).join(',')})`, 
            flex: 1,
            height: '20px'
          }} 
          />
        ))}
      </div>

      <div className='buttonHolder'>
        {isNameInRoomColors && <IonButton onClick={() => testGoToPuzzle(game.currentRoom)}>Solve Puzzle?</IonButton>}
      </div>

      {showScanner && (
        <div id="container">
          <div id="qr-reader"></div>
        </div>
      )}
      <IonButton onClick={testDeadBody}>Test Dead Body</IonButton>
      <IonCardTitle style={{ textAlign: 'center' }}>
        {/* {testText} */}
        Your Color                   
        <div
          style={{
            backgroundColor: playerColor
              ? `rgb(${extractRGB(playerColor).join(',')})`
              : 'rgb(255,255,255)',
            width: '100px',
            height: '20px',
            margin: '0 auto',
          }}
        ></div>
      </IonCardTitle>
    </div>
  );
};

export default Scanner;
