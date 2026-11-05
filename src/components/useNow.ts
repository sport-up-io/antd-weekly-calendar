import { useEffect, useState } from 'react';

const REFRESH_INTERVAL_MS = 60_000;

/** Heure actuelle, rafraîchie chaque minute. */
export const useNow = (): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return now;
};
