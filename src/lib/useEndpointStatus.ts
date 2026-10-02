import { useEffect, useState } from 'react';

const DEFAULT_ENDPOINT = 'http://localhost:4566';

export function useEndpointStatus(endpoint = DEFAULT_ENDPOINT, intervalMs = 5000) {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkEndpoint = async () => {
      try {
        setIsChecking(true);

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 1500);

        await fetch(endpoint, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (isMounted) {
          setIsOnline(true);
        }

        window.clearTimeout(timeoutId);
      } catch {
        if (isMounted) {
          setIsOnline(false);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    void checkEndpoint();
    const intervalId = window.setInterval(() => {
      void checkEndpoint();
    }, intervalMs);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [endpoint, intervalMs]);

  return {
    isOnline,
    isChecking,
    endpoint,
  };
}
