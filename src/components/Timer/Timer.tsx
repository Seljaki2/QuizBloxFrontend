import { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from './Timer.module.css';

export default function Timer({ totalSeconds = 10, onTimeUp, reset }: { totalSeconds?: number; onTimeUp?: () => void; reset?: any }) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [flashRed, setFlashRed] = useState(false);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds, reset]);


  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, totalSeconds]);

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
