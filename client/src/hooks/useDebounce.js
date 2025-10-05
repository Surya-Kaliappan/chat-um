import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
 
  const [debouncedValue, setDebouncedValue] = useState(value);  // State to store the debounced value

  useEffect(() => {
    
    const handler = setTimeout(() => {   // Set up a timer to update the debounced value
      setDebouncedValue(value);
    }, delay);

    return () => {              // This is the cleanup function. It runs if the `value` changes before the
      clearTimeout(handler);    // timer is finished, canceling the previous timer.
    };
  }, [value, delay]);    // This effect re-runs only when the input `value` or `delay` changes

  return debouncedValue;
}