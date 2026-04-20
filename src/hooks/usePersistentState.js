import { useEffect, useState } from "react";

function readValue(storageKey, initialValue) {
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    return rawValue ? JSON.parse(rawValue) : initialValue;
  } catch (error) {
    return initialValue;
  }
}

export default function usePersistentState(storageKey, initialValue) {
  const [value, setValue] = useState(() => readValue(storageKey, initialValue));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue];
}
