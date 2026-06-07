import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConceptProgress } from '../types';

interface ProgressStore {
  conceptProgress: Record<string, ConceptProgress>;
  markVisited: (conceptId: string) => void;
  recordAttempt: (conceptId: string, level: number, correct: boolean) => void;
  getProgress: (conceptId: string) => ConceptProgress;
}

const defaultProgress = (): ConceptProgress => ({
  visited: false,
  mastery: 0,
  levelsCleared: 0,
  attemptsCount: 0,
});

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      conceptProgress: {},

      markVisited: (conceptId) =>
        set((state) => ({
          conceptProgress: {
            ...state.conceptProgress,
            [conceptId]: {
              ...defaultProgress(),
              ...state.conceptProgress[conceptId],
              visited: true,
            },
          },
        })),

      recordAttempt: (conceptId, level, correct) =>
        set((state) => {
          const current = state.conceptProgress[conceptId] ?? defaultProgress();
          const newAttempts = current.attemptsCount + 1;
          // Simple ELO-like mastery update
          const delta = correct ? 5 : -2;
          const newMastery = Math.max(0, Math.min(100, current.mastery + delta));
          const newLevelsCleared = correct ? Math.max(current.levelsCleared, level) : current.levelsCleared;
          return {
            conceptProgress: {
              ...state.conceptProgress,
              [conceptId]: {
                ...current,
                mastery: newMastery,
                levelsCleared: newLevelsCleared,
                attemptsCount: newAttempts,
              },
            },
          };
        }),

      getProgress: (conceptId) => get().conceptProgress[conceptId] ?? defaultProgress(),
    }),
    { name: 'codemap-progress' }
  )
);
