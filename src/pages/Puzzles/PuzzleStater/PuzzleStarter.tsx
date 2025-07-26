import React, { useState } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import './PuzzleStarter.css'

interface ContainerProps {
  solvePuzzle: (pass: boolean) => void;
}

const PuzzleStarter: React.FC<ContainerProps> = ({ solvePuzzle }) => {
  const [gameOver, setGameOver] = useState<boolean>(false);
  

  useIonViewWillEnter(() => {
    resetGameState();
  });

  const resetGameState = () => {

  };


  return (
    <div className='puzzleStarterMain'>
      <div className='puzzleStarter'>
        
      </div>

      <div className='hintText'>
        
      </div>
    </div>
  );
};

export default PuzzleStarter;
