import { useEffect, useRef } from 'react';

export function useTimer(active: boolean, callback: () => void, interval: number) {
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(callback, interval);
    }
    return () => {
      if (intervalRef.current !== undefined) clearInterval(intervalRef.current);
    };
  }, [active, interval, callback]);
}