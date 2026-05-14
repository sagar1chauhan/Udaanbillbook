// Mock platform settings store for business types and other dynamic categories.
import { useEffect, useState } from "react";

const KEY = "Udaan.settings";

const defaultSettings = {
  businessTypes: [
    "Retail Shop",
    "Wholesale / Distribution",
    "Manufacturing",
    "Services",
    "Restaurant / Cafe",
    "Other",
  ],
};

const listeners = new Set();

function read() {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export const platformSettings = {
  get() {
    return read();
  },
  save(settings) {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
    listeners.forEach((l) => l());
  },
  update(updates) {
    const current = read();
    const updated = { ...current, ...updates };
    window.localStorage.setItem(KEY, JSON.stringify(updated));
    listeners.forEach((l) => l());
  },
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function usePlatformSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(read());
    setHydrated(true);
    const unsub = platformSettings.subscribe(() => setSettings(read()));
    return unsub;
  }, []);

  return { settings, hydrated };
}
