import React, { useEffect, useState, useRef } from 'react';
import { IonToast } from '@ionic/react';
import { useAuth } from '../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import './alarmScanner.css';
import { handleAlarmDetonated, toggleBooleanField } from '../../firebase/controller';

const AlarmScanner: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);

  useEffect(() => {
    const alarmActive = game?.isAlarmActive;
    const player = game?.players.find(p => p.email === user?.email);

    
    if (alarmActive && player && !player.ghost ) {
      setShowToast(true);
      if (game.gameSettings.alarmTimer) {
        console.log('I set timmer')
        console.log((game.gameSettings.alarmTimer))
        setCountdown(game.gameSettings.alarmTimer);
      } else {
        setCountdown(15);
      }

      startCountdown();

      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.warn('Alarm sound play failed:', err));
      }
    }

    if (!alarmActive) { stopAlarm() }

    return () => {
      stopCountdown();
    };
  }, [game?.isAlarmActive, user]);

  const startCountdown = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }

    countdownInterval.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval.current!);
          checkSaboteur()
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  const checkSaboteur = async () => {
    // Iterate through players to find the saboteur
    const saboteur = game?.players.find(player => player.isSaboteur);

    if (saboteur && user && saboteur.email === user.email) {
      // gameId, isAlarmActive, alarmDetonated, isEnded
      await handleAlarmDetonated(game.id, false, true, true);
    }
  };


  const stopCountdown = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
  };

  const silenceAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setShowToast(false);
  };

  const stopAlarm = () => {
      stopCountdown();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
  }

  return (
    <>
      {/* 🔴 Blinking red dot as a button */}
      {game?.isAlarmActive && (
        <button id="alarm-indicator" onClick={silenceAlarm} aria-label="Alarm Active">
          {countdown}
        </button>
      )}

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={`Alarm Going Off – Time Left: ${countdown}s`}
        duration={4000}
        buttons={[{ text: 'Silence', role: 'cancel', handler: silenceAlarm }]}
      />

      <audio
        ref={audioRef}
        src="https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/soundEffects%2Fsci-fi-alarm-905.mp3?alt=media&token=1f01807e-0cbe-477c-b2c0-f27902da56e9"
        preload="auto"
      />
    </>
  );
};

export default AlarmScanner;
