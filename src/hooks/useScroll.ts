import { MutableRefObject, useRef } from 'react';

export interface useScrollProps {
  scrollRef: MutableRefObject<HTMLDivElement | null>;
  // eslint-disable-next-line no-unused-vars
  scrollTo: (s: number) => void;
  dom: HTMLDivElement | null;
}

function useScroll(): useScrollProps {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollTo = (s: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = s || 0;
    }
  };
  return { dom: scrollRef.current, scrollRef, scrollTo };
}
export default useScroll;
