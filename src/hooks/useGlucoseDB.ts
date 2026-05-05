import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { createFirestoreGlucoseRepository, createIndexedDBGlucoseRepository } from '../firebase/glucoseRepository';
import type { IGlucoseRepository } from '../firebase/IGlucoseRepository';

export function useGlucoseDB(): IGlucoseRepository {
  const { user } = useAuthContext();

  return useMemo(() => {
    if (user && !user.isAnonymous) {
      return createFirestoreGlucoseRepository(user.uid);
    }
    return createIndexedDBGlucoseRepository();
  }, [user?.uid, user?.isAnonymous]);
}
