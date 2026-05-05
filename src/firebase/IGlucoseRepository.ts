import type { GlucoseRecord } from '../types';

export interface IGlucoseRepository {
  saveRecord(record: GlucoseRecord): Promise<void>;
  getAllRecords(): Promise<GlucoseRecord[]>;
  getRecordsByRange(from: Date, to: Date): Promise<GlucoseRecord[]>;
  updateRecord(id: string, patch: Partial<Pick<GlucoseRecord, 'note'>>): Promise<void>;
  deleteRecord(id: string): Promise<void>;
  clearAllRecords(): Promise<void>;
  getRecentRecords(n: number): Promise<GlucoseRecord[]>;
}
