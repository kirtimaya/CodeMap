import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NUM_CARRIERS = 4;
const NUM_VIRTUAL = 20;

interface VThread {
  id: number;
  carrierId: number | null;
  state: 'waiting' | 'running' | 'blocked';
}

export default function VirtualThreadViz() {
  const [vThreads, setVThreads] = useState<VThread[]>(
    Array.from({ length: NUM_VIRTUAL }, (_, i) => ({
      id: i,
      carrierId: i < NUM_CARRIERS ? i : null,
      state: i < NUM_CARRIERS ? 'running' : 'waiting',
    }))
  );
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const simulate = () => {
    setRunning(true);
    timerRef.current = setInterval(() => {
      setVThreads((prev) => {
        const next = [...prev.map((t) => ({ ...t }))];
        // Randomly unmount a running thread (I/O block) and mount a waiting one
        const runningThreads = next.filter((t) => t.state === 'running');
        const waitingThreads = next.filter((t) => t.state === 'waiting');

        if (runningThreads.length > 0 && waitingThreads.length > 0) {
          const toBlock = runningThreads[Math.floor(Math.random() * runningThreads.length)];
          const toRun = waitingThreads[Math.floor(Math.random() * waitingThreads.length)];
          const carrierId = toBlock.carrierId!;

          // Block the running one, give carrier to waiting one
          next[toBlock.id] = { ...toBlock, state: 'blocked', carrierId: null };
          next[toRun.id] = { ...toRun, state: 'running', carrierId };
        }

        // Randomly unblock some blocked threads back to waiting
        next.filter((t) => t.state === 'blocked').forEach((t) => {
          if (Math.random() > 0.6) {
            next[t.id] = { ...t, state: 'waiting' };
          }
        });

        return next;
      });
    }, 800);
  };

  const stop = () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setVThreads(Array.from({ length: NUM_VIRTUAL }, (_, i) => ({
      id: i,
      carrierId: i < NUM_CARRIERS ? i : null,
      state: i < NUM_CARRIERS ? 'running' : 'waiting',
    })));
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const byCarrier = Array.from({ length: NUM_CARRIERS }, (_, cid) =>
    vThreads.filter((t) => t.carrierId === cid)
  );

  return (
    <div className="rounded-xl p-4 space-y-4"
      style={{ background: '#0a0e14', border: '1px solid rgba(0,212,255,0.15)' }}>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#00d4ff' }}>
          Virtual Threads — M:N Multiplexing
        </span>
        <button onClick={running ? stop : simulate}
          className="px-3 py-1 rounded-lg text-xs"
          style={{
            background: running ? 'rgba(255,68,68,0.1)' : 'rgba(0,212,255,0.1)',
            border: `1px solid ${running ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,255,0.3)'}`,
            color: running ? '#ff4444' : '#00d4ff',
            fontFamily: 'Space Mono',
          }}>
          {running ? '■ Stop' : '▶ Simulate I/O'}
        </button>
      </div>

      {/* Carrier threads (OS threads) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono', textTransform: 'uppercase' }}>
            Carrier Threads (OS) — {NUM_CARRIERS}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {byCarrier.map((threadGroup, cid) => (
            <div key={cid} className="rounded-lg p-2"
              style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.2)' }}>
              <div style={{ fontFamily: 'Space Mono', fontSize: '9px', color: '#39ff14', marginBottom: '4px' }}>
                Carrier-{cid}
              </div>
              <div className="flex flex-wrap gap-1">
                <AnimatePresence>
                  {threadGroup.map((vt) => (
                    <motion.div
                      key={vt.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-5 h-3 rounded-sm"
                      style={{
                        background: '#00d4ff',
                        boxShadow: '0 0 4px rgba(0,212,255,0.6)',
                      }}
                      title={`VThread-${vt.id}`}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All virtual threads */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono', textTransform: 'uppercase' }}>
            Virtual Threads — {NUM_VIRTUAL}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {[['running', '#39ff14'], ['blocked (I/O)', '#f59e0b'], ['waiting', 'rgba(255,255,255,0.2)']]
              .map(([label, color]) => (
                <div key={label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono' }}>{label}</span>
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {vThreads.map((vt) => (
            <motion.div
              key={vt.id}
              className="w-6 h-4 rounded-sm flex items-center justify-center"
              animate={{
                background: vt.state === 'running' ? '#39ff14'
                  : vt.state === 'blocked' ? '#f59e0b'
                  : 'rgba(255,255,255,0.08)',
                boxShadow: vt.state === 'running' ? '0 0 6px rgba(57,255,20,0.5)' : 'none',
                y: vt.state === 'blocked' ? -4 : 0,
              }}
              title={`VThread-${vt.id}: ${vt.state}${vt.carrierId !== null ? ` (Carrier-${vt.carrierId})` : ''}`}
              style={{ fontSize: '7px', fontFamily: 'JetBrains Mono', color: 'rgba(0,0,0,0.6)' }}
            >
              {vt.id}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        {[
          { label: 'Running', value: vThreads.filter((t) => t.state === 'running').length, color: '#39ff14' },
          { label: 'I/O Blocked', value: vThreads.filter((t) => t.state === 'blocked').length, color: '#f59e0b' },
          { label: 'Waiting', value: vThreads.filter((t) => t.state === 'waiting').length, color: 'rgba(255,255,255,0.4)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color, fontWeight: 'bold' }}>{value}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono' }}>{label}</div>
          </div>
        ))}
        <div className="text-center ml-auto">
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: '#c792ea', fontWeight: 'bold' }}>~{NUM_VIRTUAL * 2}KB</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono' }}>vs {NUM_VIRTUAL}×512KB</div>
        </div>
      </div>

      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono', lineHeight: 1.5 }}>
        When a virtual thread blocks on I/O, it unmounts from its carrier. The carrier immediately picks up another ready virtual thread — no OS thread is wasted.
      </p>
    </div>
  );
}
