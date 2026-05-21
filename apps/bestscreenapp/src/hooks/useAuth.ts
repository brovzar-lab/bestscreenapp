import { useState, useEffect } from 'react';
import { isDemoMode, DEMO_USER } from '../lib/demo';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  isDemo: boolean;
}

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsDemo: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    if (isDemoMode) return;

    let unsubscribe: (() => void) | undefined;
    import('../lib/firebase').then(({ auth }) => {
      if (!auth) return;
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(auth, (fbUser) => {
          if (fbUser) {
            setUser({
              uid: fbUser.uid,
              displayName: fbUser.displayName,
              email: fbUser.email,
              isDemo: false,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      });
    });

    return () => unsubscribe?.();
  }, []);

  async function signInWithGoogle(): Promise<void> {
    if (isDemoMode) return;
    const { auth } = await import('../lib/firebase');
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function signOut(): Promise<void> {
    if (isDemoMode) {
      setUser(null);
      return;
    }
    const { auth } = await import('../lib/firebase');
    const { signOut: fbSignOut } = await import('firebase/auth');
    if (!auth) return;
    await fbSignOut(auth);
  }

  function continueAsDemo(): void {
    setUser(DEMO_USER);
  }

  return { user, loading, signInWithGoogle, signOut, continueAsDemo };
}
