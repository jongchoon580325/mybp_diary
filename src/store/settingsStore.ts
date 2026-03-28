import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgeGroup } from '../types';

interface SettingsState {
  ageGroup: AgeGroup | null;
  setAgeGroup: (group: AgeGroup) => void;
  userName: string;
  setUserName: (name: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ageGroup: null,
      setAgeGroup: (group) => set({ ageGroup: group }),
      userName: '',
      setUserName: (name) => set({ userName: name }),
    }),
    {
      name: 'bp-manager-settings', // localStorage 키
    }
  )
);
