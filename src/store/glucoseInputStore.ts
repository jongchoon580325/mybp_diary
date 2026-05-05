import { create } from 'zustand';
import type { MealTag } from '../types';

interface GlucoseInputDraft {
  mealTag:      MealTag;
  glucoseLevel: string;   // 문자열 — input 필드와 1:1 바인딩
  note:         string;
}

interface GlucoseInputActions {
  setMealTag:      (tag: MealTag) => void;
  setGlucoseLevel: (v: string)   => void;
  setNote:         (v: string)   => void;
  resetDraft:      ()            => void;
}

const defaultDraft: GlucoseInputDraft = {
  mealTag:      '공복',
  glucoseLevel: '',
  note:         '',
};

export const useGlucoseInputStore = create<GlucoseInputDraft & GlucoseInputActions>((set) => ({
  ...defaultDraft,
  setMealTag:      (tag) => set({ mealTag: tag }),
  setGlucoseLevel: (v)   => set({ glucoseLevel: v }),
  setNote:         (v)   => set({ note: v }),
  resetDraft:      ()    => set({ ...defaultDraft }),
}));
