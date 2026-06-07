import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ThreadState = 'NEW' | 'RUNNABLE' | 'BLOCKED' | 'WAITING' | 'TERMINATED';

interface Thread {
  id: number;
  state: ThreadState;
  color: string;
  name: string;
  holdsLock: boolean;
}

const STATE_COLORS: Record<ThreadState, string> = {
  NEW: '#c792ea',
  RUNNABLE: '#39ff14',
  BLOCKED: '#f59e0b',
  WAITING: '#00d4ff',
  TERMINATED: '#ff4444',
};

const STATE_POSITIONS: Record<ThreadState, { x: number; y: number }> = {
  NEW: { x: 10, y: 50 },
  RUNNABLE: { x: 130, y: 50 },
  BLOCKED: { x: 260, y: 10 },
  WAITING: { x: 260, y: 90 },
  TERMINATED: { x: 260, y: 170 },
};

const TRANSITIONS: [ThreadState, ThreadState][] = [
  ['NEW', 'RUNNABLE'],
  ['RUNNABLE', 'BLOCKED'],
  ['RUNNABLE', 'WAITING'],
  ['RUNNABLE', 'TERMINATED'],
  ['BLOCKED', 'RUNNABLE'],
  ['WAITING', 'RUNNABLE'],
];

let threadCounter = 0;
const THREAD_COLORS = ['#00d4ff', '#39ff14', '#c792ea', '#f59e0b', '#ff4444'];

export default function ThreadStateViz() {
  const [threads, setThreads] = useState<Thread[]>([
    { id: threadCounter++, state: 'RUNNABLE', color: '#00d4ff', name: 'main', holdsLock: true },
  ]);

  const addThread = () => {
    if (threads.length >= 5) return;
    const id = threadCounter++;
    setThreads((prev) => [...prev, {
      id,
      state: 'NEW',
      color: THREAD_COLORS[id % THREAD_COLORS.length],
      name: `Thread-${id}`,
      holdsLock: false,
    }]);
    // Auto-start after a moment
    setTimeout(() => {
      setThreads((prev) => prev.map((t) => t.id === id ? { ...t, state: 'RUNNABLE' } : t));
      // Maybe block on lock
      if (Math.random() > 0.4) {
        setTimeout(() => {
          setThreads((prev) => prev.map((t) => t.id === id ? { ...t, state: 'BLOCKED' } : t));
        }, 800);
      }
    }, 400);
  };

  const cycleState = (id: number) => {
    setThreads((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const cycle: ThreadState[] = ['NEW', 'RUNNABLE', 'BLOCKED', 'WAITING', 'TERMINATED'];
      const next = cycle[(cycle.indexOf(t.state) + 1) % cycle.length];
      return { ...t, state: next };
    }));
  };

  const lockHolder = threads.find((t) => t.holdsLock);
  const blockedThreads = threads.filter((t) => t.state === 'BLOCKED');

  return (
    <div className="rounded-xl p-4 space-y-4"
      style={{ background: '#0a0e14', border: '1px solid rgba(57,255,20,0.15)' }}>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#39ff14' }}>Thread State Machine</span>
        <button onClick={addThread}
          disabled={threads.length >= 5}
          className="px-3 py-1 rounded-lg text-xs"
          style={{
            background: threads.length >= 5 ? 'rgba(255,255,255,0.03)' : 'rgba(57,255,20,0.1)',
            border: `1px solid ${threads.length >= 5 ? 'rgba(255,255,255,0.08)' : 'rgba(57,255,20,0.3)'}`,
            color: threads.length >= 5 ? 'rgba(255,255,255,0.3)' : '#39ff14',
            fontFamily: 'Space Mono',
          }}>
          + Add Thread
        </button>
      </div>

      {/* State Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATE_COLORS).map(([state, color]) => (
          <div key={state} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Space Mono' }}>{state}</span>
          </div>
        ))}
      </div>

      {/* Thread list */}
      <div className="space-y-2">
        {threads.map((t) => (
          <motion.div key={t.id}
            layout
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
            onClick={() => cycleState(t.id)}
            style={{
              background: `${STATE_COLORS[t.state]}10`,
              border: `1px solid ${STATE_COLORS[t.state]}40`,
            }}
          >
            <motion.div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
              animate={{
                background: STATE_COLORS[t.state],
                boxShadow: t.state === 'RUNNABLE' ? `0 0 10px ${t.color}80` : 'none',
              }}
              style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#000' }}
            >
              {t.id}
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>
                  {t.name}
                </span>
                {t.holdsLock && (
                  <span className="px-1 py-0.5 rounded text-xs"
                    style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)', color: '#39ff14', fontSize: '8px', fontFamily: 'Space Mono' }}>
                    🔒 HOLDS LOCK
                  </span>
                )}
              </div>
            </div>
            <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: STATE_COLORS[t.state] }}>
              {t.state}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Lock contention visualization */}
      {blockedThreads.length > 0 && (
        <div className="rounded-lg p-3"
          style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'Space Mono' }}>🔐 Lock Contention</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lockHolder && (
              <span className="px-2 py-1 rounded" style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)', fontSize: '10px', color: '#39ff14', fontFamily: 'JetBrains Mono' }}>
                {lockHolder.name} (owner)
              </span>
            )}
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>←</span>
            <span style={{ fontSize: '9px', color: '#f59e0b', fontFamily: 'Space Mono' }}>blocking</span>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>→</span>
            {blockedThreads.map((t) => (
              <span key={t.id} className="px-2 py-1 rounded"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '10px', color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
        Click a thread to cycle its state
      </p>
    </div>
  );
}
