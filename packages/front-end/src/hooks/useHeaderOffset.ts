import { useEffect, useRef } from 'react';

// Read by the table's sticky column row so it parks directly under the page header. 
export const HEADER_OFFSET_VARIABLE = '--app-header-height';


//header is measured not hard-coded, 2 on desktop 1 mobile 
//grows dynamically with title length, resize doesn't re-render table 
export function useHeaderOffset<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const publish = () => {
      document.documentElement.style.setProperty(
        HEADER_OFFSET_VARIABLE,
        `${node.getBoundingClientRect().height}px`,
      );
    };

    publish();

    const observer = new ResizeObserver(publish);
    observer.observe(node);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(HEADER_OFFSET_VARIABLE);
    };
  }, []);

  return ref;
}
