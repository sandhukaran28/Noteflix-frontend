'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type User = { username: string } | null;

export function useAuth() {
  const [token, setToken] = useState<string>('');     // empty until hydrated
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);          // hydration flag

  // Read localStorage ONLY on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const t = window.localStorage.getItem('nf_token') || '';
      const u = JSON.parse(window.localStorage.getItem('nf_user') || 'null');
      if (t) setToken(t);
      if (u) setUser(u);
    } catch {}
    setReady(true);
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api<{ token: string }>(`/auth/login`, { method: 'POST', body: { username, password } });
    if (typeof data === 'string') throw new Error(data);
    setToken(data.token);
    setUser({ username });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('nf_token', data.token);
      window.localStorage.setItem('nf_user', JSON.stringify({ username }));
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('nf_token');
      window.localStorage.removeItem('nf_user');
    }
  };

  return { token, user, ready, login, logout };
}
