import { useEffect, useRef } from 'react';

//fetches data before user reaches bottom 
const PREFETCH_MARGIN = '1000px';

// when enabled is true, it rebuilds observer for infinite scroll 
// when it's false it is still scrolling
// fetch happens when user viewport comes within prefetch margin
export function useInfiniteScroll(onReach: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[entries.length - 1].isIntersecting) {
          onReach();
        }
      },
      { rootMargin: `0px 0px ${PREFETCH_MARGIN} 0px` },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled, onReach]);

  return ref;
}
