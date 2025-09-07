// src/lib/cognito.ts
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
const clientId   = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;


// No client secret for public web apps
const pool = new CognitoUserPool({ UserPoolId: userPoolId, ClientId: clientId });

export function cognitoLogin(username: string, password: string): Promise<CognitoUserSession> {
  const user = new CognitoUser({ Username: username, Pool: pool });
  const auth = new AuthenticationDetails({ Username: username, Password: password });

  return new Promise((resolve, reject) => {
    user.authenticateUser(auth, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
      // If MFA / NEW_PASSWORD_REQUIRED, add handlers here as needed
    });
  });
}

export function signUp(username: string, password: string, email?: string) {
  return new Promise<{ user: CognitoUser }>((resolve, reject) => {
    const attrs = email ? [{ Name: 'email', Value: email }] : undefined;
    pool.signUp(username, password, attrs, [], (err, result) => {
      if (err || !result) return reject(err);
      resolve({ user: result.user });
    });
  });
}

export function confirmSignUp(username: string, code: string) {
  const user = new CognitoUser({ Username: username, Pool: pool });
  return new Promise<void>((resolve, reject) => {
    user.confirmRegistration(code, true, (err) => (err ? reject(err) : resolve()));
  });
}

export function resendConfirmation(username: string) {
  const user = new CognitoUser({ Username: username, Pool: pool });
  return new Promise<void>((resolve, reject) => {
    user.resendConfirmationCode((err) => (err ? reject(err) : resolve()));
  });
}

export function getCurrentUser(): CognitoUser | null {
  return pool.getCurrentUser();
}

export function signOut() {
  const u = pool.getCurrentUser();
  if (u) u.signOut();
}
