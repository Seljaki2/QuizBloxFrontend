import { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from './Timer.module.css';

interface TimerProps {
  totalSeconds?: number;
  onFinish?: () => void;
}

export default function Timer({ totalSeconds = 10, onFinish }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [flashRed, setFlashRed] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsLeft === 0 && onFinish) {
      const timeout = setTimeout(() => onFinish(), 0);
      return () => clearTimeout(timeout);
    }
  }, [secondsLeft, onFinish]);

  useEffect(() => {
    if (secondsLeft > 0 && secondsLeft <= 5) {
      const flashInterval = setInterval(() => {
        setFlashRed(prev => !prev);
      }, 300);
      return () => clearInterval(flashInterval);
    } else {
      setFlashRed(false);
    }
  }, [secondsLeft]);

  const percentage = (secondsLeft / totalSeconds) * 100;
  const pathColor = flashRed ? '#d33434' : '#34D399';

  return (
    <CircularProgressbar
      value={percentage}
      text={`${secondsLeft}s`}
      strokeWidth={10}
      styles={buildStyles({
        pathColor,
        trailColor: '#ffffff',
        textColor: '#000000',
        textSize: '24px',
      })}
      className={styles.text}
    />
  );
}
