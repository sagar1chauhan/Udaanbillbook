// Mock client-side auth store. UI-only — no real backend.
import { useEffect, useState } from "react";

const KEY = "ledgerlite.auth";

export type MockUser = {
  name: string;
  business: string;
  phone: string;
  email?: string;
};

type Listener = () => void;
const listeners = new Set<Listener>();

function read(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

export const mockAuth = {
  get(): MockUser | null {
    return read();
  },
  signIn(user: MockUser) {
    window.localStorage.setItem(KEY, JSON.stringify(user));
    listeners.forEach((l) => l());
  },
  signOut() {
    window.localStorage.removeItem(KEY);
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useMockAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setUser(read());
    setHydrated(true);
    return mockAuth.subscribe(() => setUser(read()));
  }, []);
  return { user, hydrated, isAuthenticated: !!user };
}
