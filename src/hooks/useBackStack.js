import { useCallback, useEffect, useRef, useState } from "react";

export default function useBackStack({
  initialEntry,
  registerBackHandler,
  pushHistoryEntry,
  onEntryChange,
}) {
  const stackRef = useRef([initialEntry]);
  const [currentEntry, setCurrentEntry] = useState(initialEntry);

  const navigate = useCallback(
    (nextEntry) => {
      const current = stackRef.current[stackRef.current.length - 1];
      if (JSON.stringify(current) === JSON.stringify(nextEntry)) {
        return;
      }

      stackRef.current = [...stackRef.current, nextEntry];
      setCurrentEntry(nextEntry);
      onEntryChange?.(nextEntry);
      pushHistoryEntry?.();
    },
    [onEntryChange, pushHistoryEntry]
  );

  const reset = useCallback(
    (nextEntry = initialEntry) => {
      stackRef.current = [nextEntry];
      setCurrentEntry(nextEntry);
      onEntryChange?.(nextEntry);
    },
    [initialEntry, onEntryChange]
  );

  const goBack = useCallback(() => {
    if (stackRef.current.length <= 1) {
      return false;
    }

    stackRef.current = stackRef.current.slice(0, -1);
    const previousEntry = stackRef.current[stackRef.current.length - 1];
    setCurrentEntry(previousEntry);
    onEntryChange?.(previousEntry);
    return true;
  }, [onEntryChange]);

  useEffect(() => registerBackHandler?.(goBack), [goBack, registerBackHandler]);

  return {
    currentEntry,
    navigate,
    reset,
    canGoBack: stackRef.current.length > 1,
  };
}
