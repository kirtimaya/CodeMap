import { create } from 'zustand';
import type { DifficultyLevel, Question } from '../types';

interface TestStore {
  activeConceptId: string | null;
  activeConceptLabel: string | null;
  activeConceptTagline: string | null;
  activeLevel: DifficultyLevel;
  activeMode: 'mcq' | 'coding';
  isPanelOpen: boolean;
  currentQuestion: Question | null;
  score: { correct: number; total: number };
  openPanel: (conceptId: string, label: string, tagline: string) => void;
  closePanel: () => void;
  setLevel: (level: DifficultyLevel) => void;
  setMode: (mode: 'mcq' | 'coding') => void;
  setQuestion: (q: Question) => void;
  recordAnswer: (correct: boolean) => void;
  resetScore: () => void;
}

export const useTestStore = create<TestStore>((set) => ({
  activeConceptId: null,
  activeConceptLabel: null,
  activeConceptTagline: null,
  activeLevel: 1,
  activeMode: 'mcq',
  isPanelOpen: false,
  currentQuestion: null,
  score: { correct: 0, total: 0 },

  openPanel: (conceptId, label, tagline) =>
    set({ activeConceptId: conceptId, activeConceptLabel: label, activeConceptTagline: tagline, isPanelOpen: true, score: { correct: 0, total: 0 } }),
  closePanel: () => set({ isPanelOpen: false, activeConceptId: null }),
  setLevel: (level) => set({ activeLevel: level }),
  setMode: (mode) => set({ activeMode: mode }),
  setQuestion: (q) => set({ currentQuestion: q }),
  recordAnswer: (correct) =>
    set((state) => ({
      score: {
        correct: state.score.correct + (correct ? 1 : 0),
        total: state.score.total + 1,
      },
    })),
  resetScore: () => set({ score: { correct: 0, total: 0 } }),
}));
