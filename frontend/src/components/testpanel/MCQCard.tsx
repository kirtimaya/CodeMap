import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import type { MCQQuestion } from '../../types';
import { useProgressStore } from '../../store/progressStore';
import { useTestStore } from '../../store/testStore';

interface Props {
  question: MCQQuestion;
  onNext: () => void;
}

export function MCQCard({ question, onNext }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const { recordAttempt } = useProgressStore();
  const { recordAnswer, activeLevel } = useTestStore();

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const correct = idx === question.correctIndex;
    recordAnswer(correct);
    recordAttempt(question.conceptId, activeLevel, correct);
  };

  const handleNext = () => {
    setSelected(null);
    setRevealed(false);
    onNext();
  };

  const getOptionStyle = (idx: number) => {
    if (!revealed) {
      return {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.75)',
      };
    }
    if (idx === question.correctIndex) {
      return {
        background: 'rgba(57,255,20,0.1)',
        border: '1px solid rgba(57,255,20,0.4)',
        color: '#39ff14',
        boxShadow: '0 0 12px rgba(57,255,20,0.15)',
      };
    }
    if (idx === selected && idx !== question.correctIndex) {
      return {
        background: 'rgba(255,68,68,0.1)',
        border: '1px solid rgba(255,68,68,0.4)',
        color: '#ff4444',
      };
    }
    return {
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      color: 'rgba(255,255,255,0.35)',
    };
  };

  const isCorrect = selected === question.correctIndex;

  return (
    <motion.div
      key={question.id}
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="space-y-4"
    >
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontFamily: 'IBM Plex Sans' }}>
        {question.question}
      </p>

      <div className="space-y-2">
        {question.options.map((option, idx) => (
          <motion.button
            key={idx}
            onClick={() => handleSelect(idx)}
            whileHover={!revealed ? { x: 4 } : {}}
            whileTap={!revealed ? { scale: 0.98 } : {}}
            className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3"
            style={getOptionStyle(idx)}
            disabled={revealed}
          >
            <span style={{ fontFamily: 'Space Mono', fontSize: '11px', opacity: 0.5, flexShrink: 0 }}>
              {String.fromCharCode(65 + idx)}
            </span>
            <span style={{ fontSize: '13px', lineHeight: 1.4 }}>{option}</span>
            {revealed && idx === question.correctIndex && (
              <CheckCircle size={16} style={{ color: '#39ff14', marginLeft: 'auto', flexShrink: 0 }} />
            )}
            {revealed && idx === selected && idx !== question.correctIndex && (
              <XCircle size={16} style={{ color: '#ff4444', marginLeft: 'auto', flexShrink: 0 }} />
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl p-4"
              style={{
                background: isCorrect ? 'rgba(57,255,20,0.06)' : 'rgba(0,212,255,0.06)',
                border: `1px solid ${isCorrect ? 'rgba(57,255,20,0.2)' : 'rgba(0,212,255,0.2)'}`,
              }}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect
                  ? <CheckCircle size={14} style={{ color: '#39ff14' }} />
                  : <XCircle size={14} style={{ color: '#00d4ff' }} />
                }
                <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: isCorrect ? '#39ff14' : '#00d4ff' }}>
                  {isCorrect ? 'Correct!' : 'Not quite'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                {question.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {revealed && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="w-full py-3 rounded-xl transition-all"
          style={{
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.3)',
            color: '#00d4ff',
            fontFamily: 'Space Mono',
            fontSize: '12px',
          }}
        >
          Next Question →
        </motion.button>
      )}
    </motion.div>
  );
}
