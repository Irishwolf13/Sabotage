import React, { useEffect, useState, useRef } from 'react';
import { IonToast } from '@ionic/react';
import { useAuth } from '../../firebase/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import './alarmScanner.css';

const AlarmScanner: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const hasSeenAlarm = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuth();
  const game = useSelector((state: RootState) => state.games?.[0]);

  useEffect(() => {
    const alarmActive = game?.isAlarmActive;
    const player = game?.players.find(p => p.email === user?.email);

    if (alarmActive && player && !player.ghost && !hasSeenAlarm.current) {
      setShowToast(true);
      hasSeenAlarm.current = true;

      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.warn('Alarm sound play failed:', err));
      }
    }

    if (!alarmActive) {
      hasSeenAlarm.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [game?.isAlarmActive, user]);

  const silenceAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setShowToast(false);
  };

  return (
    <>
      {/* 🔴 Blinking red dot as a button */}
      {game?.isAlarmActive && (
        <button id="alarm-indicator" onClick={silenceAlarm} aria-label="Alarm Active"/>
      )}

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Alarm Going Off"
        duration={4000}
        buttons={[{ text: 'Silence', role: 'cancel', handler: silenceAlarm,},]}
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
