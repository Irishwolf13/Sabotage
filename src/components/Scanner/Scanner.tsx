import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import './Scanner.css'; // Import your CSS file
import { IonButton } from '@ionic/react';

interface ContainerProps {
  name: string;
}

const Scanner: React.FC<ContainerProps> = ({ name }) => {
  const [roomColors, setRoomColors] = useState<string[]>(['(255, 255, 0)']);
  const [isNameInRoomColors, setIsNameInRoomColors] = useState<boolean>(false);

  useEffect(() => {
    const onScanSuccess = (decodedText: string, decodedResult: any) => {
      console.log('result:', decodedResult);
      console.log('text:', decodedText);
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
  }, []);

  // Updates whether the name exists in roomColors whenever either changes
  useEffect(() => {
    const checkIfNameInRoomColors = roomColors.some((color) => color.includes(name));
    setIsNameInRoomColors(checkIfNameInRoomColors);
  }, [name, roomColors]);

  // Extracts numbers and converts them to integers
  const extractRGB = (colorString: any) => {
    return colorString.match(/\d+/g).map(Number);
  };

  const testButton = () => {
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
     
      <div id="container">
        <div id="qr-reader"></div>
      </div>
    </div>
  );
};

export default Scanner;
