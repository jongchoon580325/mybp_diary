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
import { getDB } from '../services/db';
import type { IGlucoseRepository } from './IGlucoseRepository';
import type { GlucoseRecord } from '../types';

// ── Firestore 헬퍼 ────────────────────────────────────────────────────────────

function glucoseCol(uid: string) {
  return collection(db, 'users', uid, 'glucose');
}

function toRecord(data: Record<string, unknown>): GlucoseRecord {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { uid: _uid, created_at_ts: _ts, ...rest } = data;
  return rest as unknown as GlucoseRecord;
}

// ── Firestore 구현 ────────────────────────────────────────────────────────────

export function createFirestoreGlucoseRepository(uid: string): IGlucoseRepository {
  return {
    async saveRecord(record) {
      const ref = doc(glucoseCol(uid), record.record_id);
      await setDoc(ref, {
        ...record,
        uid,
        created_at_ts: Timestamp.fromDate(new Date(record.measured_at)),
      });
    },

    async getAllRecords() {
      const q = query(glucoseCol(uid), orderBy('created_at_ts', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => toRecord(d.data() as Record<string, unknown>));
    },

    async getRecordsByRange(from, to) {
      const q = query(
        glucoseCol(uid),
        where('created_at_ts', '>=', Timestamp.fromDate(from)),
        where('created_at_ts', '<=', Timestamp.fromDate(to)),
        orderBy('created_at_ts', 'desc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => toRecord(d.data() as Record<string, unknown>));
    },

    async updateRecord(id, patch) {
      const ref = doc(glucoseCol(uid), id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      await updateDoc(ref, { ...patch });
    },

    async deleteRecord(id) {
      await deleteDoc(doc(glucoseCol(uid), id));
    },

    async clearAllRecords() {
      const snap = await getDocs(glucoseCol(uid));
      if (snap.empty) return;
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

    async getRecentRecords(n) {
      const q = query(glucoseCol(uid), orderBy('created_at_ts', 'desc'), limit(n));
      const snap = await getDocs(q);
      return snap.docs.map((d) => toRecord(d.data() as Record<string, unknown>));
    },
  };
}

// ── IndexedDB 구현 (게스트 / 오프라인 폴백) ───────────────────────────────────

export function createIndexedDBGlucoseRepository(): IGlucoseRepository {
  return {
    async saveRecord(record) {
      const idb = await getDB();
      await idb.put('glucose', record);
    },

    async getAllRecords() {
      const idb = await getDB();
      const all = await idb.getAllFromIndex('glucose', 'by-date');
      return all.reverse();
    },

    async getRecordsByRange(from, to) {
      const idb = await getDB();
      const range = IDBKeyRange.bound(from.toISOString(), to.toISOString());
      const result = await idb.getAllFromIndex('glucose', 'by-date', range);
      return result.reverse();
    },

    async updateRecord(id, patch) {
      const idb = await getDB();
      const existing = await idb.get('glucose', id);
      if (!existing) return;
      await idb.put('glucose', { ...existing, ...patch });
    },

    async deleteRecord(id) {
      const idb = await getDB();
      await idb.delete('glucose', id);
    },

    async clearAllRecords() {
      const idb = await getDB();
      await idb.clear('glucose');
    },

    async getRecentRecords(n) {
      const idb = await getDB();
      const all = await idb.getAllFromIndex('glucose', 'by-date');
      return all.reverse().slice(0, n);
    },
  };
}
