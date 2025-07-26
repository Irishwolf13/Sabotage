import React, { useEffect, useState, useRef } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import './Puzzle6.css';

interface ContainerProps {
  solvePuzzle: (pass: boolean) => void;
}

interface Mole {
  index: number;
  color: 'green' | 'red';
  id: number; // unique ID to differentiate overlapping
}

const Puzzle6: React.FC<ContainerProps> = ({ solvePuzzle }) => {
  const [activeMoles, setActiveMoles] = useState<Mole[]>([]);
  const [checks, setChecks] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // Ranges
  const appearIntervalRange = { min: 600, max: 800 };
  const moleDurationRange = { min: 500, max: 800 };

  const moleIdRef = useRef(0);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const randomInRange = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  useIonViewWillEnter(() => {
    resetGameState();
  });

  useEffect(() => {
    if (!gameOver) startGame();
    return stopGame;
  }, [gameOver]);

  const startGame = () => {
    const scheduleNext = () => {
      if (gameOver) return;

      const delay = randomInRange(appearIntervalRange.min, appearIntervalRange.max);
      const duration = randomInRange(moleDurationRange.min, moleDurationRange.max);

      gameLoopRef.current = setTimeout(() => {
        const usedIndexes = activeMoles.map(m => m.index);
        const available = [...Array(9).keys()].filter(i => !usedIndexes.includes(i));

        if (available.length > 0) {
          const index = available[Math.floor(Math.random() * available.length)];
          const color: 'green' | 'red' = Math.random() < 0.7 ? 'green' : 'red';
          const id = moleIdRef.current++;

          const newMole: Mole = { index, color, id };
          setActiveMoles(prev => [...prev, newMole]);

          // Remove this mole after duration
          const timeout = setTimeout(() => {
            setActiveMoles(prev => prev.filter(m => m.id !== id));
          }, duration);

          timeoutRefs.current.push(timeout);
        }

        scheduleNext(); // Recursively loop
      }, delay);
    };

    scheduleNext();
  };

  const stopGame = () => {
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    timeoutRefs.current.forEach(t => clearTimeout(t));
    timeoutRefs.current = [];
    setActiveMoles([]);
  };

  const handleClick = (index: number) => {
    const mole = activeMoles.find(m => m.index === index);
    if (!mole) return;

    if (mole.color === 'green') {
      setChecks(prev => {
        const newVal = prev + 1;
        if (newVal >= 6) {
          setGameOver(true);
          setWon(true);
        }
        return newVal;
      });
    } else {
      setStrikes(prev => {
        const newVal = prev + 1;
        if (newVal >= 3) {
          setGameOver(true);
          setWon(false);
        }
        return newVal;
      });
    }

    // Remove clicked mole
    setActiveMoles(prev => prev.filter(m => m.id !== mole.id));
  };

  const resetGameState = () => {
    setChecks(0);
    setStrikes(0);
    setGameOver(false);
    setWon(false);
    setActiveMoles([]);
    timeoutRefs.current.forEach(t => clearTimeout(t));
    timeoutRefs.current = [];
  };

  return (
    <div className='puzzle6Main'>
      <div className='scoreBoard'>
        ✅ {checks} / 6 &nbsp;&nbsp; ❌ {strikes} / 3
      </div>

      <div className='puzzle6'>
        {[...Array(9)].map((_, i) => {
          const mole = activeMoles.find(m => m.index === i);
          const colorClass = mole ? mole.color : '';

          return (
            <button
              key={i}
              className={`moleButton ${colorClass}`}
              onClick={() => handleClick(i)}
              disabled={gameOver}
            />
          );
        })}
      </div>

      {gameOver && (
        <div className='overlay'>
          {won ? (
            <>
              <h1>YOU WIN!</h1>
              <button className='resetButton' onClick={() => solvePuzzle(true)}>
                OK
              </button>
            </>
          ) : (
            <>
              <h1>YOU LOST</h1>
              <button className='resetButton' onClick={resetGameState}>
                Try Again?
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Puzzle6;
