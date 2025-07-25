import React, { useState, useEffect } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import './Puzzle5.css';

interface ContainerProps {
  solvePuzzle: (pass: boolean) => void;
}

const Puzzle5: React.FC<ContainerProps> = ({ solvePuzzle }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [patternSequence, setPatternSequence] = useState<number[]>([]);
  const [showPattern, setShowPattern] = useState(false);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [roundFailed, setRoundFailed] = useState(false);
  const [roundLocked, setRoundLocked] = useState(true);
  const pauseTimeSpeed = 200

  const patternSettings = [
    { speed: 350, colors: 4 },
    { speed: 275, colors: 5 },
    { speed: 200, colors: 6 },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (roundCompleted || roundFailed) {
      setRoundLocked(true);
      timer = setTimeout(() => {
        setRoundCompleted(false);
        setRoundFailed(false);
        setUserSequence([]);
        setPatternSequence([]);
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [roundCompleted, roundFailed]);

  const resetGameState = () => {
    setCurrentRound(0);
    setUserSequence([]);
    setPatternSequence([]);
    setShowPattern(false);
    setIsDisplaying(false);
    setCountdown(null);
    setRoundCompleted(false);
    setRoundFailed(false);
    setRoundLocked(true);
  };

  const generatePattern = () => {
    const colors = patternSettings[currentRound].colors;
    const newPattern = Array.from({ length: colors }, () => Math.floor(Math.random() * 4));
    setPatternSequence(newPattern);
    setShowPattern(true);
  };

  const displayPattern = async () => {
    setIsDisplaying(true);
    for (let i = 0; i < patternSequence.length; i++) {
      highlightButton(patternSequence[i]);
      await new Promise(res => setTimeout(res, patternSettings[currentRound].speed));
      unhighlightButtons();
      await new Promise(res => setTimeout(res, pauseTimeSpeed));
    }
    setIsDisplaying(false);
    setRoundLocked(false);
  };

  const highlightButton = (index: number) => {
    const button = document.querySelector(`.simonButton${index}`);
    if (button) button.classList.add('active');
  };

  const unhighlightButtons = () => {
    const buttons = document.querySelectorAll('.simonButton');
    buttons.forEach(button => button.classList.remove('active'));
  };

  useEffect(() => {
    if (showPattern && patternSequence.length > 0) {
      displayPattern();
    }
  }, [patternSequence]);

  useEffect(() => {
    if (countdown !== null && countdown >= 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          setCountdown(null); // Stop showing the countdown
          generatePattern();   // Start the round
        } else {
          setCountdown(prev => (prev !== null ? prev - 1 : null));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleStartRound = () => {
    if (roundCompleted) {
      setCountdown(3);
      setShowPattern(false);
    } else if (roundFailed) {
      resetGameState();
    } else if (!isDisplaying && currentRound < patternSettings.length && countdown === null && !roundCompleted) {
      setUserSequence([]);
      setCountdown(3);
      setShowPattern(false);
    }
  };

  const handleUserInput = (direction: number) => {
    if (roundLocked || isDisplaying || countdown !== null) return;

    highlightButton(direction);
    setTimeout(() => {
      unhighlightButtons();
    }, 300);

    const newUserSequence = [...userSequence, direction];
    setUserSequence(newUserSequence);
    const correct = patternSequence.slice(0, newUserSequence.length);

    if (JSON.stringify(newUserSequence) === JSON.stringify(correct)) {
      if (newUserSequence.length === patternSequence.length) {
        if (currentRound === patternSettings.length - 1) {
          solvePuzzle(true);
        } else {
          setRoundCompleted(true);
          setCurrentRound(prev => prev + 1);
          setRoundLocked(true);
        }
      }
    } else {
      setRoundFailed(true);
      setRoundLocked(true);
    }
  };

  useIonViewWillEnter(() => {
    resetGameState();
  });

  return (
    <div className="puzzle5Main">
      <div className="progress">
        {patternSettings.map((_, index) => (
          <div
            key={index}
            className={`checkbox ${index < currentRound ? 'active' : ''}`}
          ></div>
        ))}
      </div>

      <div className="simonSaysContainer">
        <div className="simonButton simonButton0" onClick={() => handleUserInput(0)}></div>
        <div className="simonButton simonButton1" onClick={() => handleUserInput(1)}></div>
        <div className="simonButton simonButton2" onClick={() => handleUserInput(2)}></div>
        <div className="simonButton simonButton3" onClick={() => handleUserInput(3)}></div>

        {/* Overlay center display */}
        {countdown !== null && <div className="centerOverlay">{countdown}</div>}
        {roundCompleted && <div className="centerOverlay checkmark">✔</div>}
        {roundFailed && <div className="centerOverlay failmark">✖</div>}
      </div>

      <button
        className="startButton"
        onClick={handleStartRound}
        disabled={isDisplaying || countdown !== null}
      >
        Start Round
      </button>

    </div>
  );
};

export default Puzzle5;
