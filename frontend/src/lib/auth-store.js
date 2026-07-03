// Client-side auth store. Manages token and session state for the authenticated database user.
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
    window.localStorage.removeItem("Udaan.admin_auth");
    listeners.forEach((l) => l());
  },
  updateUser(updates) {
    const current = read();
    if (current) {
      const updated = { ...current, ...updates };
      window.localStorage.setItem(KEY, JSON.stringify(updated));
      listeners.forEach((l) => l());
    }
  },
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY || e.key === "Udaan.admin_auth") {
      listeners.forEach((l) => l());
    }
  });
}

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
