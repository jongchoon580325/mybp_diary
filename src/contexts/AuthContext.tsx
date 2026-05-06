import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAuth, type AuthState } from '../firebase/useAuth';
import { createFirestoreRepository } from '../firebase/repository';
import { createFirestoreGlucoseRepository } from '../firebase/glucoseRepository';
import { getDB } from '../services/db';

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.user?.uid) return;

    const syncFirestoreToIndexedDB = async () => {
      try {
        const bpRepo = createFirestoreRepository(auth.user!.uid);
        const glucoseRepo = createFirestoreGlucoseRepository(auth.user!.uid);

        const [bpSessions, glucoseRecords] = await Promise.all([
          bpRepo.getAllSessions(),
          glucoseRepo.getAllRecords(),
        ]);

        const idb = await getDB();
        const tx = idb.transaction(['sessions', 'glucose'], 'readwrite');

        for (const session of bpSessions) {
          await tx.objectStore('sessions').put(session);
        }

        for (const record of glucoseRecords) {
          await tx.objectStore('glucose').put(record);
        }

        await tx.done;
      } catch (err) {
        console.error('Firestore → IndexedDB 동기화 실패:', err);
      }
    };

    syncFirestoreToIndexedDB();
  }, [auth.user?.uid]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
