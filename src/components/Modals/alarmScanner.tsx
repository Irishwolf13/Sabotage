import React, { useEffect, useState, useRef } from 'react';
import { IonToast } from '@ionic/react';
import { useAuth } from '../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';

const AlarmScanner: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const hasSeenAlarm = useRef(false);
  const alarmAudio = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);

  useEffect(() => {
    // Create audio element once
    if (!alarmAudio.current) {
      alarmAudio.current = new Audio('https://firebasestorage.googleapis.com/v0/b/sabotage-e6488.firebasestorage.app/o/soundEffects%2Fsci-fi-alarm-905.mp3?alt=media&token=1f01807e-0cbe-477c-b2c0-f27902da56e9');
      alarmAudio.current.loop = true;
    }

    const alarmActive = game?.isAlarmActive;
    const player = game?.players.find(p => p.email === user?.email);

    if (alarmActive && player && !player.ghost && !hasSeenAlarm.current) {
      setShowToast(true);
      hasSeenAlarm.current = true;

      // Play sound
      alarmAudio.current?.play().catch(err => {
        console.warn('Alarm sound play failed:', err);
      });
    }

    if (!alarmActive) {
      hasSeenAlarm.current = false;
      // Stop sound
      if (alarmAudio.current) {
        alarmAudio.current.pause();
        alarmAudio.current.currentTime = 0;
      }
    }
  }, [game?.isAlarmActive, user]);

  return (
    <>
      {/* 🔴 Blinking red dot */}
      {game?.isAlarmActive && (
        <div
          id="alarm-indicator"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'red',
            border: '2px solid white',
            boxShadow: '0 0 8px red',
            animation: 'blink 1s infinite',
            zIndex: 10000,
          }}
        />
      )}

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Alarm Going Off"
        duration={4000}
        buttons={[
          {
            text: 'Dismiss',
            role: 'cancel',
            handler: () => setShowToast(false),
          },
        ]}
      />

      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.2; }
          }
        `}
      </style>
    </>
  );
};

export default AlarmScanner;
