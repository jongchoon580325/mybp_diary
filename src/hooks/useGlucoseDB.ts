import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { createFirestoreGlucoseRepository, createIndexedDBGlucoseRepository } from '../firebase/glucoseRepository';
import type { IGlucoseRepository } from '../firebase/IGlucoseRepository';

export function useGlucoseDB(): IGlucoseRepository {
  const { user } = useAuthContext();

  const uid = user?.uid;
  const isAnonymous = user?.isAnonymous;

  return useMemo(() => {
    if (uid && !isAnonymous) {
      return createFirestoreGlucoseRepository(uid);
    }
    return createIndexedDBGlucoseRepository();
  }, [uid, isAnonymous]);
}
