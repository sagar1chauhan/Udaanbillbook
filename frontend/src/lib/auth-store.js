// Mock client-side auth store. UI-only — no real backend.
import { useEffect, useState } from "react";

const KEY = "Udaan.auth";

const listeners = new Set();

function read() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const mockAuth = {
  get() {
    return read();
  },
  signIn(user) {
    window.localStorage.setItem(KEY, JSON.stringify(user));
    listeners.forEach((l) => l());
  },
  signOut() {
    window.localStorage.removeItem(KEY);
    listeners.forEach((l) => l());
  },
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useMockAuth() {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setUser(read());
    setHydrated(true);
    const unsub = mockAuth.subscribe(() => setUser(read()));
    return () => {
      unsub();
    };
  }, []);
  return { user, hydrated, isAuthenticated: !!user };
}
