import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import './Scanner.css'; // Import your CSS file
import { IonButton } from '@ionic/react';
import { getRoomColors } from '../../firebase/controller';
import { RootState } from '../../stores/store';
import { useSelector } from 'react-redux';

interface ContainerProps {
  name: string;
}

const Scanner: React.FC<ContainerProps> = ({ name }) => {
  const [roomColors, setRoomColors] = useState<string[]>([]);
  const [isNameInRoomColors, setIsNameInRoomColors] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(true);
  const game = useSelector((state: RootState) => state.games[0]);

  useEffect(() => {
    if (!showScanner) return;

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
      console.log('result:', decodedResult);
      console.log('text:', decodedText);

      // Extract the number from the 'decodedText'
      const roomNumberString = decodedText.replace("Room ", "");
      const roomNumber = parseInt(roomNumberString, 10);

      // Use the extracted number in the function call
      const colors = await getRoomColors(game.id, roomNumber);
      setRoomColors(colors);

      // Hide scanner after a successful scan
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
    console.log(name);
    console.log(roomColors);
    console.log(isNameInRoomColors);
  };

  return (
    <div>
      {/* <button onClick={testButton}>Test Button</button> */}
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
      <div className='buttonHolder'>
        {isNameInRoomColors && <IonButton>Solve Puzzle?</IonButton>}
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
