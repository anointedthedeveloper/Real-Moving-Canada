import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '../services/authService.js';

const AuthContext = createContext(null);

/**
 * Holds the signed-in customer. With no auth backend yet, the session check
 * resolves to null and login/signup reject with an explanatory message.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    auth.fetchSession().then((u) => { if (alive) { setUser(u); setChecking(false); } });
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (credentials) => { const u = await auth.login(credentials); setUser(u); return u; }, []);
  const signup = useCallback(async (details) => { const u = await auth.signup(details); setUser(u); return u; }, []);
  const logout = useCallback(async () => { await auth.logout(); setUser(null); }, []);

  const value = useMemo(() => ({ user, checking, login, signup, logout }), [user, checking, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
