import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { IBpRepository } from './IBpRepository';
import type { MeasurementSession } from '../types';

function sessionsCol(uid: string) {
  return collection(db, 'users', uid, 'sessions');
}

function toSession(data: Record<string, unknown>): MeasurementSession {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { uid: _uid, created_at: _ts, ...rest } = data;
  return rest as unknown as MeasurementSession;
}

export function createFirestoreRepository(uid: string): IBpRepository {
  return {
    async saveSession(session) {
      const ref = doc(sessionsCol(uid), session.session_id);
      await setDoc(ref, {
        ...session,
        uid,
        created_at: Timestamp.fromDate(new Date(session.measured_at)),
      });
    },

    async getAllSessions() {
      const q = query(sessionsCol(uid), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => toSession(d.data() as Record<string, unknown>));
    },

    async getSessionsByRange(from, to) {
      const q = query(
        sessionsCol(uid),
        where('created_at', '>=', Timestamp.fromDate(from)),
        where('created_at', '<=', Timestamp.fromDate(to)),
        orderBy('created_at', 'desc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => toSession(d.data() as Record<string, unknown>));
    },

    async updateSession(id, patch) {
      const ref = doc(sessionsCol(uid), id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      await updateDoc(ref, { ...patch });
    },

    async deleteSession(id) {
      await deleteDoc(doc(sessionsCol(uid), id));
    },

    async clearAllSessions() {
      const snap = await getDocs(sessionsCol(uid));
      if (snap.empty) return;
      // Firestore 배치 삭제 (최대 499건씩)
      const chunks: typeof snap.docs[] = [];
      for (let i = 0; i < snap.docs.length; i += 499) {
        chunks.push(snap.docs.slice(i, i + 499));
      }
      await Promise.all(
        chunks.map((chunk) => {
          const batch = writeBatch(db);
          chunk.forEach((d) => batch.delete(d.ref));
          return batch.commit();
        }),
      );
    },

    async getRecentSessions(n) {
      const q = query(sessionsCol(uid), orderBy('created_at', 'desc'), limit(n));
      const snap = await getDocs(q);
      return snap.docs.map((d) => toSession(d.data() as Record<string, unknown>));
    },
  };
}
