// src/hooks/useAuth.ts
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cognitoLogin, getCurrentUser, signOut,signUp as poolSignUp, confirmSignUp as poolConfirm, resendConfirmation } from '@/lib/cognito';


type User = { username: string } | null;

type Stored = {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  username: string;
  exp: number; // epoch seconds for id token expiry
};

const KEY = 'nf_auth';

function readStored(): Stored | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(data: Stored | null) {
  if (typeof window === 'undefined') return;
  if (!data) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function useAuth() {
  const [token, setToken] = useState<string>(''); // we'll store the ID token here
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = readStored();
    if (s && s.idToken) {
      setToken(s.idToken);
      setUser({ username: s.username });
    }
    setReady(true);
  }, []);

  const login = async (username: string, password: string) => {
    // Authenticate against Cognito (SRP)
    const session = await cognitoLogin(username, password);

    const idToken = session.getIdToken().getJwtToken();
    const accessToken = session.getAccessToken().getJwtToken();
    const refreshToken = session.getRefreshToken().getToken();

    // Basic decode to get exp (no verification needed on client; backend will verify)
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    const exp = payload['exp'] as number;

    setToken(idToken);
    setUser({ username });

    writeStored({ idToken, accessToken, refreshToken, username, exp });
  };

  const logout = () => {
    setToken('');
    setUser(null);
    writeStored(null);
    signOut();
  };

   const register = async (username: string, password: string, email?: string) => {
    await poolSignUp(username, password, email);
    // user remains unconfirmed until code entered
  };

  const confirm = async (username: string, code: string) => {
    await poolConfirm(username, code);
  };

  const resendCode = async (username: string) => {
    await resendConfirmation(username);
  };


  // OPTIONAL: token refresh (basic)
  const maybeRefresh = async () => {
    const s = readStored();
    if (!s) return;
    const now = Math.floor(Date.now() / 1000);
    if (s.exp - now < 60) {
      // refresh flow (requires storing CognitoUser and calling refreshSession)
      // You can add it later; for now rely on re-login if token expires.
    }
  };

  return { token, user, ready, login, logout, register, confirm, resendCode, api  };
}
