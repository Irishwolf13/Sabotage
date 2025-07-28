import React, { useEffect, useState, useRef } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import './Puzzle6.css';

interface ContainerProps {
  solvePuzzle: (pass: boolean) => void;
}

interface Mole {
  index: number;
  color: 'green' | 'red';
  id: number;
  clicked?: boolean;
}

const Puzzle6: React.FC<ContainerProps> = ({ solvePuzzle }) => {
  const [activeMoles, setActiveMoles] = useState<Mole[]>([]);
  const [checks, setChecks] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Things to change for more difficulty
  const targetChecks = 6
  const targetStrikes = 2
  const appearIntervalRange = { min: 600, max: 1200 };
  const moleDurationRange = { min: 500, max: 1000 };

  const moleIdRef = useRef(0);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const randomInRange = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  useIonViewWillEnter(() => {
    resetGameState();
  });

  useEffect(() => {
    if (!gameOver && gameStarted) startGame(); // Only start game if gameStarted is true
    return stopGame;
  }, [gameOver, gameStarted]);

  const startGame = () => {
    const scheduleNext = () => {
      if (gameOver || !gameStarted) return; // Check gameStarted state

      const delay = randomInRange(appearIntervalRange.min, appearIntervalRange.max);
      const duration = randomInRange(moleDurationRange.min, moleDurationRange.max);

      gameLoopRef.current = setTimeout(() => {
        const usedIndexes = activeMoles.map(m => m.index);
        const available = [...Array(9).keys()].filter(i => !usedIndexes.includes(i));

        if (available.length > 0) {
          const index = available[Math.floor(Math.random() * available.length)];
          const color: 'green' | 'red' = Math.random() < 0.7 ? 'green' : 'red';
          const id = moleIdRef.current++;

          const newMole: Mole = { index, color, id, clicked: false };
          setActiveMoles(prev => [...prev, newMole]);

          // Remove mole after duration (if not clicked)
          const timeout = setTimeout(() => {
            setActiveMoles(prev => prev.filter(m => m.id !== id));
          }, duration);

          timeoutRefs.current.push(timeout);
        }

        scheduleNext();
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
    if (gameOver) return;

    const mole = activeMoles.find(m => m.index === index && !m.clicked);
    if (!mole) return;

    // Mark mole as clicked to prevent double clicks & trigger animation
    setActiveMoles(prev =>
      prev.map(m =>
        m.id === mole.id ? { ...m, clicked: true } : m
      )
    );

    if (mole.color === 'green') {
      setChecks(prev => {
        const newVal = prev + 1;
        if (newVal >= targetChecks) {
          setGameOver(true);
          setWon(true);
        }
        return newVal;
      });
    } else {
      setStrikes(prev => {
        const newVal = prev + 1;
        if (newVal >= targetStrikes) {
          setGameOver(true);
          setWon(false);
        }
        return newVal;
      });
    }

    // Remove mole immediately after animation delay (pop animation length)
    setTimeout(() => {
      setActiveMoles(prev => prev.filter(m => m.id !== mole.id));
    }, 200);
  };

  const resetGameState = () => {
    setChecks(0);
    setStrikes(0);
    setGameOver(false);
    setWon(false);
    setActiveMoles([]);
    setGameStarted(false); // Reset gameStarted state
    timeoutRefs.current.forEach(t => clearTimeout(t));
    timeoutRefs.current = [];
  };

  return (
  <div className='puzzle6Main'>
    
    <div className='hintTextHolder'>
      <div className='hintText'>Click on Green Squares.</div>
      <div className='hintText'>Avoid Red Squares.</div>
    </div>

    <div className='puzzle6'>
      {[...Array(9)].map((_, i) => {
        const mole = activeMoles.find(m => m.index === i);
        const colorClass = mole ? mole.color : '';
        const clickedClass = mole?.clicked ? 'clicked' : '';

        return (
          <button
            key={i}
            className={`moleButton ${colorClass} ${clickedClass}`}
            onClick={() => handleClick(i)}
            disabled={!gameStarted || gameOver || !!mole?.clicked}
            aria-label={colorClass === 'green' ? 'green mole' : 'red mole'}
          />
        );
      })}
    </div>

    <div className='scoreBoard'>
      ✅ {checks} / 6 &nbsp;&nbsp; ❌ {strikes} / {targetStrikes}
    </div>
    {gameOver && won && (
      <div className='overlay'>
        <div className='overlayPadding'>
          <h1>YOU WIN!</h1>
          <button className='resetButton' onClick={() => solvePuzzle(true)}>
            OK
          </button>
        </div>
      </div>
    )}
    <button 
      onClick={() => {
        if (gameOver) resetGameState();
        setGameStarted(true);
      }} 
      className={`startButton ${(gameStarted && !gameOver) ? 'invisible' : ''}`}>
      {gameOver ? 'Try Again?' : 'Start Game'}
    </button>
  </div>
);
};

export default Puzzle6;
