import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonModal, IonButtons } from '@ionic/react';
import '../Puzzles.css';

interface ContainerProps {
  solvePuzzle: (pass:boolean) => void;
}

const Puzzle3: React.FC<ContainerProps> = ({ solvePuzzle }) => {
  const colors = [ 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink' ];
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [collectedCircles, setCollectedCircles] = useState<string[]>([]);

  const generateRandomColorSequence = (length: number) =>
    Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)]);

  // Helper to count occurrences of each color
  const getColorCounts = (sequence: string[]) => {
    return sequence.reduce<Record<string, number>>((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});
  };

  useEffect(() => {
    setTargetSequence(generateRandomColorSequence(5));
  }, []);
  
  // These next two useEffects could be combined, but for now, I'm going to keep the seperate
  // Reset circles if the elements don't match the target sequence
  useEffect(() => {
    const isMatching = collectedCircles.every((color, index) => color === targetSequence[index]);

    if (!isMatching && collectedCircles.length > 0) {
      setCollectedCircles([]); 
    }
  }, [collectedCircles, targetSequence]);

  // The final check for passing the puzzle
  useEffect(() => {
    if ( collectedCircles.length === targetSequence.length && collectedCircles.length > 0) {
      const targetCounts = getColorCounts(targetSequence);
      const collectedCounts = getColorCounts(collectedCircles);
      const pass = Object.keys(targetCounts).every(
        color => collectedCounts[color] === targetCounts[color]
      );

      solvePuzzle(pass);
    }
  }, [collectedCircles, targetSequence]);

  const handleCircleClick = (color: string, event: any) => {
    setCollectedCircles((prev) => [...prev, color]);

    const clickedCircle = event.target as HTMLDivElement;
    if (clickedCircle && clickedCircle.parentNode) {
      clickedCircle.parentNode.removeChild(clickedCircle);
    }
  };
  
  const throwCircles = () => {
    const container = document.querySelector('.circle-container');
    if (!container) return;

    const circle = document.createElement('div');
    const minSize = 60;
    const maxSize = 130;
    const size = Math.random() * (maxSize - minSize) + minSize;

    // Random speed not depending on size
    const minSpeed = 2000; // Minimum duration in milliseconds
    const maxSpeed = 7000; // Maximum duration in milliseconds
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

    const color = colors[Math.floor(Math.random() * colors.length)];

    circle.className = 'circle';
    circle.style.backgroundColor = color;
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;

    const startTop = Math.random() * (container.clientHeight - size);
    const endTop = Math.random() * (container.clientHeight - size);

    circle.style.top = `${startTop}px`;
    circle.style.left = `100vw`;

    container.appendChild(circle);

    setTimeout(() => {
      circle.style.transition = `transform ${speed}ms linear`;
      circle.style.transform = `translateX(-150vw) translateY(${endTop - startTop}px)`;

      const extraTimeBuffer = 1000;

      setTimeout(() => {
        if (circle.parentElement) {
          circle.parentElement.removeChild(circle);
        }
      }, speed + extraTimeBuffer);
    }, 100);

    circle.onclick = (e) => handleCircleClick(color, e);

    setTimeout(throwCircles, Math.random() * 500 + 500);
  };

  useEffect(() => {
    throwCircles();
  }, []);

  return (
    <div className='puzzle3Main'>
      <div>
        <h4 className='centeredText'>Collection Order</h4>
        <div className="target-sequence">
          {targetSequence.map((color, index) => (
            <div key={index} className="target-circle" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>

      <div className="circle-container" />

      <div className="collected-circles">
        {collectedCircles.map((color, index) => (
          <div key={index} className="collected-circle" style={{ backgroundColor: color }} />
        ))}
      </div>

      <div className='hintText'>
        <span>Touch a circle to collect color</span>
        <br></br>
        <span>Collect colors in collection order</span>
      </div>
    </div>
  );
};

export default Puzzle3;
