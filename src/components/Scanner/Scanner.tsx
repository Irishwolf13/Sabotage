import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import './Scanner.css'; // Import your CSS file
import { IonButton } from '@ionic/react';
import { getRoomColors, toggleBooleanField } from '../../firebase/controller';
import { RootState } from '../../stores/store';
import { useSelector } from 'react-redux';

interface ContainerProps {
  name: string;
  handleSolvePuzzleButton: () => void;
}

const Scanner: React.FC<ContainerProps> = ({ name, handleSolvePuzzleButton }) => {
  const [roomColors, setRoomColors] = useState<string[]>([]);
  const [isNameInRoomColors, setIsNameInRoomColors] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(true);
  // const [testText, setTestText] = useState('text...')
  const game = useSelector((state: RootState) => state.games[0]);

  useEffect(() => {
    if (!showScanner) return;

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
      // setTestText(decodedText);
      
      if (decodedText.includes("Room")) {
        const roomNumberString = decodedText.replace("Room ", "");
        const roomNumber = parseInt(roomNumberString);
        const colors = await getRoomColors(game.id, roomNumber);
        setRoomColors(colors);
      }
      if (decodedText.includes("Dead")) {
        await toggleBooleanField(game.id, "foundDead", false);
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
    const checkIfNameInRoomColors = roomColors.some((color) => color.includes(name));
    setIsNameInRoomColors(checkIfNameInRoomColors);
  }, [name, roomColors]);

  // Extracts numbers and converts them to integers
  const extractRGB = (colorString: any) => {
    return colorString.match(/\d+/g).map(Number);
  };

  const testButton = async () => {
    console.log(roomColors);
    console.log(isNameInRoomColors);
    const colors = await getRoomColors(game.id, 0);
    setRoomColors(colors);
  };

  return (
    <div>
      <button onClick={testButton}>test</button>
      {/* <p>{testText}</p> */}
      <div className='colorHolder'>
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

      <IonButton onClick={handleSolvePuzzleButton}>Test Puzzle</IonButton>
      <div className='buttonHolder'>
        {isNameInRoomColors && <IonButton onClick={handleSolvePuzzleButton}>Solve Puzzle?</IonButton>}
      </div>

      {showScanner && (
        <div id="container">
          <div id="qr-reader"></div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
