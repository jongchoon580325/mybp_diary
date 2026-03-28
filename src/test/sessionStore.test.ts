import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore, calcAverage } from '../store/sessionStore';

describe('calcAverage', () => {
  it('3회 평균 올바르게 계산', () => {
    const avg = calcAverage([
      { sys: 128, dia: 82, pul: 74 },
      { sys: 124, dia: 79, pul: 72 },
      { sys: 126, dia: 80, pul: 73 },
    ]);
    expect(avg).toEqual({ sys: 126, dia: 80, pul: 73 });
  });
});

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
  });

  it('reading 추가 후 step 증가', () => {
    useSessionStore.getState().addReading({ sys: 120, dia: 80, pul: 72 });
    expect(useSessionStore.getState().readings).toHaveLength(1);
  });

  it('resetSession 후 초기화', () => {
    useSessionStore.getState().addReading({ sys: 120, dia: 80, pul: 72 });
    useSessionStore.getState().resetSession();
    expect(useSessionStore.getState().readings).toHaveLength(0);
  });
});
