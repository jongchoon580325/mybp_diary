import { openDB, type IDBPDatabase } from 'idb';
import type { MeasurementSession, GlucoseRecord } from '../types';

const DB_NAME    = 'bp-manager-db';
const DB_VERSION = 2;  // v1: sessions / v2: + glucose

export interface BpDB {
  sessions: {
    key: string;
    value: MeasurementSession;
    indexes: {
      'by-date':      string;  // measured_at
      'by-age-group': string;  // age_group
      'by-status':    string;  // ai_status
    };
  };
  glucose: {
    key: string;
    value: GlucoseRecord;
    indexes: {
      'by-date':     string;  // measured_at
      'by-meal-tag': string;  // meal_tag
      'by-status':   string;  // status
    };
  };
}

let dbInstance: IDBPDatabase<BpDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<BpDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BpDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // v1: sessions 스토어 (기존 데이터 유지)
      if (oldVersion < 1) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'session_id' });
        sessions.createIndex('by-date',      'measured_at', { unique: false });
        sessions.createIndex('by-age-group', 'age_group',   { unique: false });
        sessions.createIndex('by-status',    'ai_status',   { unique: false });
      }

      // v2: glucose 스토어 추가
      if (oldVersion < 2) {
        const glucose = db.createObjectStore('glucose', { keyPath: 'record_id' });
        glucose.createIndex('by-date',     'measured_at', { unique: false });
        glucose.createIndex('by-meal-tag', 'meal_tag',    { unique: false });
        glucose.createIndex('by-status',   'status',      { unique: false });
      }
    },
  });

  return dbInstance;
}
