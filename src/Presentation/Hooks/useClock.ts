import { useState, useEffect } from 'react';

const formatTime = (date: Date): string =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const useClock = (): string => {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
};
