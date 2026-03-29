import { create } from 'zustand';
import type { Reading, TimeSlot, Arm, Posture } from '../types';

interface SessionDraft {
  readings: Reading[];        // 0~3개
  timeSlot: TimeSlot;
  arm: Arm;
  posture: Posture;
  memo: string;
}

interface SessionActions {
  addReading: (r: Reading) => void;
  removeLastReading: () => void;
  resetSession: () => void;
  setTimeSlot: (v: TimeSlot) => void;
  setArm: (v: Arm) => void;
  setPosture: (v: Posture) => void;
  setMemo: (v: string) => void;
}

const defaultDraft: SessionDraft = {
  readings: [],
  timeSlot: '아침',
  arm: '왼쪽 팔',
  posture: '앉은 자세',
  memo: '',
};

export const useSessionStore = create<SessionDraft & SessionActions>((set) => ({
  ...defaultDraft,

  addReading: (r) => set((s) => ({ readings: [...s.readings, r] })),
  removeLastReading: () => set((s) => ({ readings: s.readings.slice(0, -1) })),
  resetSession: () => set({ ...defaultDraft }),
  setTimeSlot: (v) => set({ timeSlot: v }),
  setArm: (v) => set({ arm: v }),
  setPosture: (v) => set({ posture: v }),
  setMemo: (v) => set({ memo: v }),
}));

/** 3회 평균 계산 */
export function calcAverage(readings: Reading[]): Reading {
  const n = readings.length;
  return {
    sys: Math.round(readings.reduce((s, r) => s + r.sys, 0) / n),
    dia: Math.round(readings.reduce((s, r) => s + r.dia, 0) / n),
    pul: Math.round(readings.reduce((s, r) => s + r.pul, 0) / n),
  };
}
