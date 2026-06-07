import React, { useState, lazy, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lightbulb, ChevronDown } from 'lucide-react';
import type { CodingQuestion } from '../../types';
import { useProgressStore } from '../../store/progressStore';
import { useTestStore } from '../../store/testStore';
import { gradeStream } from '../../api/client';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface Props {
  question: CodingQuestion;
  onNext: () => void;
}

function EditorFallback() {
  return (
    <div className="h-64 flex items-center justify-center rounded-xl"
      style={{ background: '#0a0e14', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono' }}>Loading editor...</span>
      </div>
    </div>
  );
}

function isPassingFeedback(text: string): boolean {
  const lower = text.toLowerCase();
  const positives = ['correct', 'well done', 'great', 'excellent', 'solid', 'good job', 'passes', 'nicely done', 'well-written'];
  const negatives = ['incorrect', 'missing', 'fails', 'does not', "doesn't", 'wrong', 'incomplete', 'bug'];
  const posCount = positives.filter((w) => lower.includes(w)).length;
  const negCount = negatives.filter((w) => lower.includes(w)).length;
  return posCount >= negCount;
}

export function CodeChallenge({ question, onNext }: Props) {
  const [code, setCode] = useState(question.starterCode);
  const [showHints, setShowHints] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradingText, setGradingText] = useState<string | null>(null);
  const [gradingDone, setGradingDone] = useState(false);
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [passing, setPassing] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const { recordAttempt } = useProgressStore();
  const { recordAnswer, activeLevel, activeConceptId, activeConceptLabel } = useTestStore();

  // Cancel any in-flight stream when unmounting
  useEffect(() => () => { cancelRef.current?.(); }, []);

  const runCode = () => {
    cancelRef.current?.();
    setGrading(true);
    setGradingText('');
    setGradingDone(false);
    setGradingError(null);
    setPassing(false);

    const cancel = gradeStream(
      {
        conceptId: activeConceptId ?? question.conceptId,
        conceptLabel: activeConceptLabel ?? question.conceptId,
        level: activeLevel,
        userCode: code,
        prompt: question.prompt,
        rubric: question.rubric,
      },
      (token) => setGradingText((prev) => (prev ?? '') + token),
      () => {
        setGrading(false);
        setGradingDone(true);
        setGradingText((text) => {
          const passed = isPassingFeedback(text ?? '');
          setPassing(passed);
          recordAnswer(passed);
          recordAttempt(activeConceptId ?? question.conceptId, activeLevel, passed);
          return text;
        });
      },
      (err) => {
        setGrading(false);
        setGradingDone(true);
        setGradingError(err.message);
        recordAnswer(false);
        recordAttempt(activeConceptId ?? question.conceptId, activeLevel, false);
      },
    );
    cancelRef.current = cancel;
  };

  return (
    <div className="space-y-4">
      {/* Problem statement */}
      <div className="rounded-xl p-4"
        style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 rounded-full" style={{ background: '#00d4ff' }} />
          <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: '#00d4ff', textTransform: 'uppercase' }}>Problem</span>
        </div>
        <pre style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'IBM Plex Sans' }}>
          {question.prompt}
        </pre>
      </div>

      {/* Editor */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <Suspense fallback={<EditorFallback />}>
          <MonacoEditor
            height="280px"
            language="java"
            value={code}
            onChange={(val) => setCode(val ?? '')}
            theme="vs-dark"
            options={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </Suspense>
      </div>

      {/* Hints toggle */}
      <button onClick={() => setShowHints((v) => !v)}
        className="flex items-center gap-2 text-xs"
        style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono' }}>
        <Lightbulb size={12} style={{ color: '#f59e0b' }} />
        {showHints ? 'Hide' : 'Show'} Hints
        <ChevronDown size={12} style={{ transform: showHints ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl p-4 space-y-2"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              {question.hints.map((hint, i) => (
                <div key={i} className="flex gap-2">
                  <span style={{ color: '#f59e0b', fontSize: '11px', flexShrink: 0 }}>💡</span>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{hint}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <button onClick={runCode} disabled={grading}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
        style={{
          background: grading ? 'rgba(255,255,255,0.05)' : 'rgba(57,255,20,0.1)',
          border: `1px solid ${grading ? 'rgba(255,255,255,0.08)' : 'rgba(57,255,20,0.3)'}`,
          color: grading ? 'rgba(255,255,255,0.4)' : '#39ff14',
          fontFamily: 'Space Mono',
          fontSize: '12px',
          cursor: grading ? 'not-allowed' : 'pointer',
        }}>
        {grading ? (
          <>
            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Play size={14} />
            Submit Solution
          </>
        )}
      </button>

      {/* Streaming grading result */}
      <AnimatePresence>
        {(gradingText !== null || gradingError) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {gradingError ? (
              <div className="rounded-xl p-4"
                style={{ background: 'rgba(255,70,70,0.06)', border: '1px solid rgba(255,70,70,0.2)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,120,120,0.9)', fontFamily: 'Space Mono' }}>
                  Grading failed: {gradingError}
                </p>
              </div>
            ) : (
              <div className="rounded-xl p-4"
                style={{
                  background: gradingDone
                    ? (passing ? 'rgba(57,255,20,0.07)' : 'rgba(0,212,255,0.06)')
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${gradingDone
                    ? (passing ? 'rgba(57,255,20,0.25)' : 'rgba(0,212,255,0.2)')
                    : 'rgba(255,255,255,0.07)'}`,
                  transition: 'background 0.4s, border-color 0.4s',
                }}>
                {/* Streaming cursor while grading */}
                {!gradingDone && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: '#00d4ff' }}>Claude is reviewing...</span>
                  </div>
                )}
                <pre style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'IBM Plex Sans',
                }}>
                  {gradingText}
                  {!gradingDone && <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse align-middle ml-0.5" />}
                </pre>
              </div>
            )}

            {gradingDone && (
              <button onClick={onNext}
                className="w-full py-3 rounded-xl"
                style={{
                  background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)',
                  color: '#00d4ff', fontFamily: 'Space Mono', fontSize: '12px',
                }}>
                Next Challenge →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
