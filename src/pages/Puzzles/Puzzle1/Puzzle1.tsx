import React, { useState } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import '../Puzzles.css'

interface ContainerProps {
  solvePuzzle: (pass:boolean) => void;
}

const Puzzle1: React.FC<ContainerProps> = ({ solvePuzzle }) => {
  const [placedColors, setPlacedColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [shuffledCircles, setShuffledCircles] = useState<string[]>([]);
  const [shuffledBoxes, setShuffledBoxes] = useState<string[]>([]);
  const colors = ['red', 'blue', 'green', 'yellow'];
  
  // Reset the game state
  useIonViewWillEnter(() => { resetGameState(); });
  
  // Reset game state
  const resetGameState = () => {
    setPlacedColors([]);
    setSelectedColor(null);
    setShuffledCircles(shuffleArray([...colors]));
    setShuffledBoxes(shuffleArray([...colors]));
  };
  
  // Shuffle
  const shuffleArray = (array: string[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleCircleClick = (color: string) => {
    if (!placedColors.includes(color)) {
      setSelectedColor(selectedColor === color ? null : color);
    }
  };

  const handleBoxClick = (boxColor: string) => {
    if (selectedColor) {
      if (selectedColor === boxColor && !placedColors.includes(selectedColor)) {
        // Correct placement
        setPlacedColors([...placedColors, selectedColor]);
        if (placedColors.length + 1 === colors.length) {
          solvePuzzle(true);
        }
      }
      // Reset the selected color
      setSelectedColor(null);
    }
  };
  
  return (
    <div className='puzzle1Main'>
      <div className='puzzle1'>

        <div className='puzzle1Circles'>
          {shuffledCircles.map((color) => (
            <div
              key={color}
              onClick={() => handleCircleClick(color)}
              style={{
                width: 50,
                height: 50,
                backgroundColor: selectedColor === color || placedColors.includes(color) ? 'transparent' : color,
                border: `2px solid ${color}`,
                borderRadius: '50%',
                margin: 10,
                cursor: 'pointer',
                opacity: placedColors.includes(color) ? 0.5 : 1,
              }}
            />
          ))}
        </div>
        <div>
          {shuffledBoxes.map((color) => (
            <div
              key={color}
              onClick={() => handleBoxClick(color)}
              style={{
                width: 60,
                height: 60,
                backgroundColor: placedColors.includes(color) ? color : 'transparent',
                border: `2px solid ${color}`,
                margin: 10,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
      <div className='hintText'>
        <span>Touch a circle to pick up color</span>
        <br></br>
        <span>Touch a square to drop the color</span>
        <br></br>
        <span>Drop all colors into matching squares</span>
      </div>
    </div>
  );
};

export default Puzzle1;
