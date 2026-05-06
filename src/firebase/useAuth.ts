import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  linkWithPopup,
  type User,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAnonymous: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  linkToGoogle: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInAsGuest = async () => {
    await signInAnonymously(auth);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  // 게스트 → Google 계정 연결 (UID 그대로 유지)
  const linkToGoogle = async () => {
    if (!auth.currentUser) return;
    await linkWithPopup(auth.currentUser, googleProvider);
  };

  return {
    user,
    isLoading,
    isAnonymous: user?.isAnonymous ?? false,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    linkToGoogle,
  };
}
