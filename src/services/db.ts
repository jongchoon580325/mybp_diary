import { openDB, type IDBPDatabase } from 'idb';
import type { MeasurementSession } from '../types';

const DB_NAME = 'bp-manager-db';
const DB_VERSION = 1;

export interface BpDB {
  sessions: {
    key: string; // session_id (UUID)
    value: MeasurementSession;
    indexes: {
      'by-date': string;       // measured_at
      'by-age-group': string;  // age_group
      'by-status': string;     // ai_status
    };
  };
}

let dbInstance: IDBPDatabase<BpDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<BpDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BpDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('sessions', { keyPath: 'session_id' });
      store.createIndex('by-date',      'measured_at', { unique: false });
      store.createIndex('by-age-group', 'age_group',   { unique: false });
      store.createIndex('by-status',    'ai_status',   { unique: false });
    },
  });

  return dbInstance;
}
