import { useState, useEffect } from 'react';

export function useGameTimer(timerData) {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    let tick = null;
    if (timerData) {
      tick = setInterval(() => {
        if (timerData.isPaused) {
          setRemainingTime(Math.floor(timerData.remainingTime / 1000));
        } else {
          const rem = Math.max(0, Math.floor((timerData.expiresAt - Date.now()) / 1000));
          setRemainingTime(rem);
        }
      }, 500);
    } else {
      setRemainingTime(0);
    }
    return () => {
      if (tick) clearInterval(tick);
    };
  }, [timerData]);

  return remainingTime;
}
