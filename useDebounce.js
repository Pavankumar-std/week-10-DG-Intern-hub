import { useState, useEffect } from 'react';

// Returns `value` only after the user stops changing it for `delay` ms.
// Used in search so we do NOT call the API on every key press.
export default function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cancel if the user types again
  }, [value, delay]);

  return debounced;
}
