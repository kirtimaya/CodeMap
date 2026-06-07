import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, HelpCircle } from 'lucide-react';
import { useTestStore } from '../../store/testStore';
import { DifficultySelector } from './DifficultySelector';
import { MCQCard } from './MCQCard';
import { CodeChallenge } from './CodeChallenge';
import { getQuestionsForConcept } from '../../content/seedQuestions';
import { generateQuestion } from '../../api/client';
import type { MCQQuestion, CodingQuestion, DifficultyLevel } from '../../types';

export function TestPanel() {
  const {
    isPanelOpen,
    closePanel,
    activeConceptId,
    activeConceptLabel,
    activeConceptTagline,
    activeLevel,
    activeMode,
    setLevel,
    setMode,
    score,
  } = useTestStore();

  const [questionIdx, setQuestionIdx] = useState(0);
  const [questions, setQuestions] = useState<(MCQQuestion | CodingQuestion)[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const fetchKeyRef = useRef(0);

  // Reload questions whenever concept / level / mode changes
  useEffect(() => {
    if (!activeConceptId) {
      setQuestions([]);
      return;
    }

    const seeds = getQuestionsForConcept(activeConceptId, activeLevel, activeMode);
    // Seeds returned a non-fallback match — use them immediately
    if (seeds.length > 0 && seeds.some((q) => q.conceptId === activeConceptId)) {
      setQuestions(seeds);
      setQuestionIdx(0);
      setFetchError(null);
      return;
    }

    // No seed match — generate from backend
    if (!activeConceptLabel || !activeConceptTagline) {
      setQuestions(seeds); // generic fallback seeds
      return;
    }

    const key = ++fetchKeyRef.current;
    setLoading(true);
    setFetchError(null);

    generateQuestion(activeConceptId, activeConceptLabel, activeConceptTagline, activeLevel, activeMode)
      .then((q) => {
        if (fetchKeyRef.current !== key) return; // stale response
        setQuestions([q]);
        setQuestionIdx(0);
      })
      .catch((err: unknown) => {
        if (fetchKeyRef.current !== key) return;
        setFetchError((err as Error).message ?? 'Failed to generate question');
        setQuestions(seeds); // fall back to seeds on error
      })
      .finally(() => {
        if (fetchKeyRef.current === key) setLoading(false);
      });
  }, [activeConceptId, activeConceptLabel, activeConceptTagline, activeLevel, activeMode]);

  const currentQuestion = questions[questionIdx % Math.max(questions.length, 1)] ?? null;

  const handleNext = useCallback(() => {
    // If we're on a generated (single) question, fetch a fresh one
    if (questions.length === 1 && activeConceptId && activeConceptLabel && activeConceptTagline) {
      const key = ++fetchKeyRef.current;
      setLoading(true);
      setFetchError(null);
      generateQuestion(activeConceptId, activeConceptLabel, activeConceptTagline, activeLevel, activeMode)
        .then((q) => {
          if (fetchKeyRef.current !== key) return;
          setQuestions([q]);
          setQuestionIdx(0);
        })
        .catch(() => {
          if (fetchKeyRef.current !== key) return;
          setQuestionIdx((i) => i + 1);
        })
        .finally(() => {
          if (fetchKeyRef.current === key) setLoading(false);
        });
    } else {
      setQuestionIdx((i) => i + 1);
    }
  }, [questions.length, activeConceptId, activeConceptLabel, activeConceptTagline, activeLevel, activeMode]);

  const handleLevelChange = (l: DifficultyLevel) => {
    setLevel(l);
    setQuestionIdx(0);
  };

  const handleModeChange = (m: 'mcq' | 'coding') => {
    setMode(m);
    setQuestionIdx(0);
  };

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 h-full z-50 flex flex-col"
            style={{
              width: '480px',
              background: '#0d1117',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h2 style={{ fontFamily: 'Space Mono', fontSize: '14px', color: '#00d4ff' }}>Practice Mode</h2>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                  {activeConceptLabel ?? activeConceptId ?? 'All concepts'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Score */}
                <div className="text-right">
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: '#39ff14' }}>
                    <motion.span key={score.correct} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
                      {score.correct}
                    </motion.span>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>/{score.total}</span>
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>correct</div>
                </div>
                <button onClick={closePanel}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1 px-4 pt-4">
              {(['mcq', 'coding'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs transition-all flex-1 justify-center"
                  style={{
                    background: activeMode === m ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${activeMode === m ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: activeMode === m ? '#00d4ff' : 'rgba(255,255,255,0.45)',
                    fontFamily: 'Space Mono',
                  }}
                >
                  {m === 'mcq' ? <HelpCircle size={12} /> : <Code size={12} />}
                  {m === 'mcq' ? 'Multiple Choice' : 'Coding Challenge'}
                </button>
              ))}
            </div>

            {/* Difficulty selector */}
            <div className="px-4 pt-3">
              <DifficultySelector value={activeLevel} onChange={handleLevelChange} />
            </div>

            {/* Question area */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-48 gap-3"
                  >
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <p style={{ fontFamily: 'Space Mono', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      Generating question with Claude...
                    </p>
                  </motion.div>
                ) : fetchError ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl p-4 text-center"
                    style={{ background: 'rgba(255,70,70,0.06)', border: '1px solid rgba(255,70,70,0.2)' }}
                  >
                    <p style={{ fontSize: '12px', color: 'rgba(255,120,120,0.9)', fontFamily: 'Space Mono' }}>
                      Backend unavailable — showing seed questions
                    </p>
                  </motion.div>
                ) : currentQuestion ? (
                  currentQuestion.type === 'mcq' ? (
                    <MCQCard
                      key={`${currentQuestion.id}-${questionIdx}`}
                      question={currentQuestion as MCQQuestion}
                      onNext={handleNext}
                    />
                  ) : (
                    <CodeChallenge
                      key={`${currentQuestion.id}-${questionIdx}`}
                      question={currentQuestion as CodingQuestion}
                      onNext={handleNext}
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono', fontSize: '12px' }}>
                      No questions found for this concept at this level.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '8px' }}>
                      Try a different level or concept.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
