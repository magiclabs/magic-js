import { useEffect, useState, useRef } from 'react';

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function onChange(event: MediaQueryListEvent) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setValue(event.matches);
      }, 150);
    }

    const result = window.matchMedia(query);
    result.addEventListener('change', onChange);
    setValue(result.matches);

    return () => {
      result.removeEventListener('change', onChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  return value;
}
