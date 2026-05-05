import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgeGroup, DiabetesType, GlucoseTarget } from '../types';

interface SettingsState {
  // ── 혈압 ──────────────────────────────────────────────────────────────────
  ageGroup:    AgeGroup | null;
  setAgeGroup: (group: AgeGroup) => void;
  userName:    string;
  setUserName: (name: string) => void;

  // ── 혈당 ──────────────────────────────────────────────────────────────────
  diabetesType:    DiabetesType;
  setDiabetesType: (type: DiabetesType) => void;
  glucoseTarget:   GlucoseTarget | null;
  setGlucoseTarget: (target: GlucoseTarget | null) => void;

  // ── 초기화 ────────────────────────────────────────────────────────────────
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 혈압
      ageGroup:    null,
      setAgeGroup: (group) => set({ ageGroup: group }),
      userName:    '',
      setUserName: (name) => set({ userName: name }),

      // 혈당
      diabetesType:     '없음',
      setDiabetesType:  (type) => set({ diabetesType: type }),
      glucoseTarget:    null,
      setGlucoseTarget: (target) => set({ glucoseTarget: target }),

      // 초기화
      resetSettings: () => set({
        ageGroup: null, userName: '',
        diabetesType: '없음', glucoseTarget: null,
      }),
    }),
    {
      name: 'bp-manager-settings',
    }
  )
);
