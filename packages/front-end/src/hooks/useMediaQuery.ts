import { useCallback, useSyncExternalStore } from 'react';

// never renders 2 layouts. (desktop/mobile), automatically chooses one 
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener('change', onChange);

    return () => list.removeEventListener('change', onChange);
  }, [query]);

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
