import { getDB } from '../services/db';
import type { MeasurementSession } from '../types';

export function useDB() {
  /** 세션 저장 */
  async function saveSession(session: MeasurementSession): Promise<void> {
    const db = await getDB();
    await db.put('sessions', session);
  }

  /** 전체 세션 조회 (날짜 역순) */
  async function getAllSessions(): Promise<MeasurementSession[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('sessions', 'by-date');
    return all.reverse();
  }

  /** 기간 내 세션 조회 */
  async function getSessionsByRange(from: Date, to: Date): Promise<MeasurementSession[]> {
    const db = await getDB();
    const fromStr = from.toISOString();
    const toStr   = to.toISOString();
    const range = IDBKeyRange.bound(fromStr, toStr);
    const result = await db.getAllFromIndex('sessions', 'by-date', range);
    return result.reverse();
  }

  /** 세션 부분 수정 (메모만 수정 가능) */
  async function updateSession(
    id: string,
    patch: Partial<Pick<MeasurementSession, 'memo'>>
  ): Promise<void> {
    const db = await getDB();
    const existing = await db.get('sessions', id);
    if (!existing) return;
    await db.put('sessions', { ...existing, ...patch });
  }

  /** 세션 삭제 */
  async function deleteSession(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('sessions', id);
  }

  /** 전체 초기화 */
  async function clearAllSessions(): Promise<void> {
    const db = await getDB();
    await db.clear('sessions');
  }

  /** 최근 N건 조회 */
  async function getRecentSessions(n: number): Promise<MeasurementSession[]> {
    const all = await getAllSessions();
    return all.slice(0, n);
  }

  return {
    saveSession,
    getAllSessions,
    getSessionsByRange,
    updateSession,
    deleteSession,
    clearAllSessions,
    getRecentSessions,
  };
}
