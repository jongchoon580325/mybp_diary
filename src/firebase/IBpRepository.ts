import type { MeasurementSession } from '../types';

export interface IBpRepository {
  saveSession(session: MeasurementSession): Promise<void>;
  getAllSessions(): Promise<MeasurementSession[]>;
  getSessionsByRange(from: Date, to: Date): Promise<MeasurementSession[]>;
  updateSession(id: string, patch: Partial<Pick<MeasurementSession, 'memo'>>): Promise<void>;
  deleteSession(id: string): Promise<void>;
  clearAllSessions(): Promise<void>;
  getRecentSessions(n: number): Promise<MeasurementSession[]>;
}
