"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored =
        typeof window !== "undefined" ? window.localStorage.getItem(key) : null;

      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.error(
        `Error reading localStorage key "${key}":`,
        (error as Error)?.message,
      );
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(
        `Error setting localStorage key "${key}":`,
        (error as Error)?.message,
      );
    }
  }, [key, value]);

  return [value, setValue] as const;
}
