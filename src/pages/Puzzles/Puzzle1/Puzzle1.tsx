import React, { useState } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import './Puzzle1.css'

interface ContainerProps {
  solvePuzzle: (pass: boolean) => void;
}

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const MAX_ATTEMPTS = 6;

const Puzzle1: React.FC<ContainerProps> = ({ solvePuzzle }) => {
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>(['', '', '', '']);
  const [guesses, setGuesses] = useState<{ guess: string[]; feedback: { correct: number; wrongPosition: number } }[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_ATTEMPTS);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [knownPositions, setKnownPositions] = useState<(string | null)[]>([null, null, null, null]);

  useIonViewWillEnter(() => {
    resetGameState();
  });

  const resetGameState = () => {
    const code = Array.from({ length: 4 }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
    setSecretCode(code);
    setCurrentGuess(['', '', '', '']);
    setGuesses([]);
    setAttemptsLeft(MAX_ATTEMPTS);
    setGameOver(false);
    setKnownPositions([null, null, null, null]);
  };

  const handleColorChange = (index: number) => {
    if (gameOver) return;

    const currentColor = currentGuess[index];
    const currentIndex = COLORS.indexOf(currentColor);
    const nextColor = COLORS[(currentIndex + 1) % COLORS.length] || COLORS[0];

    const newGuess = [...currentGuess];
    newGuess[index] = nextColor;
    setCurrentGuess(newGuess);
  };

  const checkGuess = () => {
    let correct = 0;
    let wrongPosition = 0;
    const codeCopy = [...secretCode];
    const guessCopy = [...currentGuess];

    const newKnown = [...knownPositions];

    // Step 1: Find correct positions
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] === codeCopy[i]) {
        correct++;
        newKnown[i] = guessCopy[i]; // Save known position
        codeCopy[i] = '';
        guessCopy[i] = '_';
      }
    }

    // Step 2: Find correct colors in wrong positions
    for (let i = 0; i < 4; i++) {
      const idx = codeCopy.indexOf(guessCopy[i]);
      if (idx > -1 && guessCopy[i] !== '_') {
        wrongPosition++;
        codeCopy[idx] = '';
      }
    }

    const newGuesses = [...guesses, {
      guess: [...currentGuess],
      feedback: { correct, wrongPosition }
    }];
    setGuesses(newGuesses);
    setKnownPositions(newKnown);

    const autoFilledGuess = newKnown.map((val, i) => val ?? '');
    setCurrentGuess(autoFilledGuess);

    const remaining = attemptsLeft - 1;
    setAttemptsLeft(remaining);

    if (correct === 4) {
      resetGameState()
      solvePuzzle(true);
      setGameOver(true);
    } else if (remaining === 0) {
      setGameOver(true);
    }
  };


  return (
    <div className='puzzle1Main'>
      <div className='puzzle1'>
        <div className='solutionText'>Solution</div>
        <div className="solutionReveal">
          {(gameOver ? secretCode : knownPositions).map((color, idx) => (
            <div key={idx} className={`solutionDot ${color ?? 'unknown'}`}>
              {color ? '' : '?'}
            </div>
          ))}
        </div>
        {!gameOver && (
          <div className="guessRow">
            {currentGuess.map((color, idx) => {
              const isLocked = knownPositions[idx] !== null;

              return (
                <button
                  key={idx}
                  className={`colorBtn ${color} ${isLocked ? 'locked' : ''}`}
                  onClick={() => !isLocked && handleColorChange(idx)}
                  disabled={isLocked}
                  title={isLocked ? 'Correct color locked in!' : 'Click to change'}
                >
                  {color || 'Pick'}
                </button>
              );
            })}
          </div>
        )}
        {!gameOver ? (
          <button className="submitBtn" onClick={checkGuess} disabled={currentGuess.includes('')}>
            Submit
          </button>
        ) : (
          <button className="retryBtn" onClick={resetGameState}>
            Try Again
          </button>
        )}

        <div className="guessHistory">
          {guesses.map((entry, index) => (
            <div key={index} className="guessRow">
              {entry.guess.map((color, idx) => (
                <div key={idx} className={`colorDot ${color}`} />
              ))}
              <div className="feedbackText">
                ✅ {entry.feedback.correct} | 🔄 {entry.feedback.wrongPosition}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='hintText'>
        {!gameOver && <span>{attemptsLeft} tries remaining</span>}
      </div>
    </div>
  );
};

export default Puzzle1;
