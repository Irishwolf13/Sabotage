import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import './Scanner.css'; // Import your CSS file
import { IonButton, IonCardTitle } from '@ionic/react';
import { toggleBooleanField, updateStringField, adjustSaboteurAvailableRooms, checkRoomMatch } from '../../firebase/controller';
import { RootState } from '../../stores/store';
import { useDispatch, useSelector } from 'react-redux';
import { updateAttribute } from '../../stores/gameSlice';
import { useAuth } from '../../firebase/AuthContext';

interface ContainerProps {
  handleSolvePuzzleButton: (puzzleNumber:number) => void;
}

const Scanner: React.FC<ContainerProps> = ({ handleSolvePuzzleButton }) => {
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
          const currentPlayer = game.players.find(p => p.email === user.email);
          
          if (currentPlayer) {
            if (currentPlayer.isSaboteur) {
              await adjustSaboteurAvailableRooms(game.id, roomNumber);
            } else {
              selectPuzzleAndRoom(roomNumber)
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

  const selectPuzzleAndRoom = async (roomNumber: number) => {
    try {
      if (user && user.email) {
        const currentPlayer = game.players.find(p => p.email === user.email);
        
        if (currentPlayer) {
          if (currentPlayer.isSaboteur) {
            await adjustSaboteurAvailableRooms(game.id, roomNumber);
            const getRandomNumber = Math.floor(Math.random() * 3) + 1;
            handleSolvePuzzleButton(getRandomNumber);
          } else {
            const isCorrectRoom = await checkRoomMatch(game.id, user.email, roomNumber)
            if (isCorrectRoom) {
              // Frank, eventually, this will want to be something other than random...
              dispatch(updateAttribute({ id: game.id, key: 'currentRoom', value: roomNumber })); 
              const getRandomNumber = Math.floor(Math.random() * 3) + 1;
              handleSolvePuzzleButton(getRandomNumber);
            } else {
              console.log('not my room fool.')
            }
          }
        } else {
          console.error('Player not found');
        }
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
      <IonButton onClick={() => selectPuzzleAndRoom(0)}>Test 0</IonButton>
      <IonButton onClick={() => selectPuzzleAndRoom(1)}>Test 1</IonButton>
      <IonButton onClick={() => selectPuzzleAndRoom(2)}>Test 2</IonButton>
      <IonButton onClick={() => selectPuzzleAndRoom(3)}>Test 3</IonButton>
      <IonButton onClick={() => selectPuzzleAndRoom(4)}>Test 4</IonButton>
      <IonButton onClick={() => selectPuzzleAndRoom(5)}>Test 5</IonButton>

      {showScanner && (
        <div id="container">
          <div id="qr-reader"></div>
        </div>
      )}
      <IonButton onClick={testDeadBody}>Test Dead Body</IonButton>
      <IonCardTitle style={{ textAlign: 'center' }}>

      </IonCardTitle>
    </div>
  );
};

export default Scanner;
