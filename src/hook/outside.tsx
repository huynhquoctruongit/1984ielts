import { useEffect, useRef } from 'react';
export default function useOnClickOutside(ref:any, handler:any) {
  const inside = useRef(false);
  useEffect(
    () => {
      const listener = (event:any) => {
        // console.log(ref.current.contains(event.target));
        if (!ref.current || ref.current.contains(event.target)) {
          inside.current = true;
          return;
        }
        if (inside.current) {
          inside.current = false;
          handler(event);
          return;
        }
        handler(event);
      };
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);
      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },
    [ref, handler]
  );
}
