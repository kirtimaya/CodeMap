import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DifficultyLevel } from '../../types';

const LEVELS: { level: DifficultyLevel; label: string; desc: string; color: string }[] = [
  { level: 1, label: 'L1', desc: 'Fundamentals', color: '#39ff14' },
  { level: 2, label: 'L2', desc: 'Junior', color: '#00d4ff' },
  { level: 3, label: 'L3', desc: 'Mid-level', color: '#c792ea' },
  { level: 4, label: 'L4', desc: 'Senior', color: '#f59e0b' },
  { level: 5, label: 'L5', desc: 'Expert', color: '#ff4444' },
];

const LEVEL_DETAILS: Record<DifficultyLevel, string> = {
  1: 'Core terminology, basic definitions, and "what is X" questions. No coding required.',
  2: 'How and why questions. Basic usage patterns. Simple code reading.',
  3: 'Trade-off analysis, common pitfalls, and moderately complex coding problems.',
  4: 'Deep internals, performance implications, and real-world architectural decisions.',
  5: 'JVM internals, edge cases, distributed systems nuances. Expert-level coding challenges.',
};

interface Props {
  value: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
}

export function DifficultySelector({ value, onChange }: Props) {
  const current = LEVELS.find((l) => l.level === value)!;

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {LEVELS.map((lvl) => {
          const isSelected = lvl.level === value;
          return (
            <button
              key={lvl.level}
              onClick={() => onChange(lvl.level)}
              className="relative flex-1 flex flex-col items-center py-2 rounded-lg transition-all"
              style={{
                background: isSelected ? `${lvl.color}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? `${lvl.color}60` : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: isSelected ? lvl.color : 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                {lvl.label}
              </span>
              <span style={{ fontSize: '9px', color: isSelected ? lvl.color : 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
                {lvl.desc}
              </span>
              {isSelected && (
                <motion.div
                  layoutId="difficulty-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ background: lvl.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="px-3 py-2 rounded-lg"
          style={{
            background: `${current.color}08`,
            border: `1px solid ${current.color}20`,
          }}
        >
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            <span style={{ color: current.color, fontFamily: 'Space Mono', fontSize: '10px' }}>{current.desc}: </span>
            {LEVEL_DETAILS[value]}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
