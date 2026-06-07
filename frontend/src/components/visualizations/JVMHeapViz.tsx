import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeapObject {
  id: number;
  age: number;
  size: number;
  zone: 'eden' | 's0' | 's1' | 'old' | 'dead';
  color: string;
}

const COLORS = ['#00d4ff', '#39ff14', '#f59e0b', '#c792ea', '#ff4444'];
let nextId = 0;

function ZoneBar({ label, color, objects, capacity, highlight }: {
  label: string;
  color: string;
  objects: HeapObject[];
  capacity: number;
  highlight: boolean;
}) {
  const fill = Math.min(100, (objects.length / capacity) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: 'Space Mono', fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color }}>
          {objects.length}/{capacity}
        </span>
      </div>
      <div className="relative h-6 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: highlight ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)' }}>
        <motion.div
          className="absolute left-0 top-0 h-full rounded"
          animate={{ width: `${fill}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          style={{ background: `${color}33` }}
        />
        <div className="absolute inset-0 flex flex-wrap gap-0.5 p-0.5 overflow-hidden">
          <AnimatePresence>
            {objects.slice(0, capacity).map((obj) => (
              <motion.div
                key={obj.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: `${obj.size * 8}px`,
                  height: '14px',
                  background: obj.color,
                  borderRadius: '2px',
                  flexShrink: 0,
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function JVMHeapViz() {
  const [eden, setEden] = useState<HeapObject[]>([]);
  const [s0, setS0] = useState<HeapObject[]>([]);
  const [s1, setS1] = useState<HeapObject[]>([]);
  const [old, setOld] = useState<HeapObject[]>([]);
  const [gcPhase, setGcPhase] = useState<string | null>(null);
  const [minorGcCount, setMinorGcCount] = useState(0);
  const [speed, setSpeed] = useState(1);
  const gcInProgress = useRef(false);

  const allocate = useCallback(() => {
    const obj: HeapObject = {
      id: nextId++,
      age: 0,
      size: Math.ceil(Math.random() * 2),
      zone: 'eden',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setEden((prev) => {
      const next = [...prev, obj];
      if (next.length >= 12 && !gcInProgress.current) runMinorGC();
      return next;
    });
  }, []);

  const runMinorGC = useCallback(async () => {
    if (gcInProgress.current) return;
    gcInProgress.current = true;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms / speed));

    setGcPhase('Minor GC — scanning Eden...');
    await delay(600);

    setEden((prev) => {
      // ~70% survive a minor GC on first pass
      const survivors = prev.filter(() => Math.random() > 0.6).map((o) => ({ ...o, age: o.age + 1 }));
      const promote = survivors.filter((o) => o.age >= 3);
      const toS0 = survivors.filter((o) => o.age < 3);

      setGcPhase('Copying survivors to S0...');
      setS0(toS0);
      setOld((prev) => [...prev, ...promote].slice(0, 18));

      return []; // clear Eden
    });

    await delay(600);
    setGcPhase(null);
    setMinorGcCount((n) => n + 1);
    gcInProgress.current = false;
  }, [speed]);

  const runFullGC = useCallback(async () => {
    if (gcInProgress.current) return;
    gcInProgress.current = true;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms / speed));

    setGcPhase('Full GC — marking all live objects...');
    await delay(800);
    setGcPhase('Full GC — sweeping Old Gen...');
    await delay(600);
    setOld((prev) => prev.filter(() => Math.random() > 0.4));
    setEden([]);
    setS0([]);
    setS1([]);
    await delay(400);
    setGcPhase(null);
    gcInProgress.current = false;
  }, [speed]);

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: '#0a0e14', border: '1px solid rgba(0,212,255,0.15)' }}>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#00d4ff' }}>JVM Heap Visualizer</span>
        {gcPhase && (
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
            ⚡ {gcPhase}
          </motion.span>
        )}
      </div>

      {/* Young Generation */}
      <div className="rounded-lg p-3 space-y-2"
        style={{ border: '1px solid rgba(57,255,20,0.2)', background: 'rgba(57,255,20,0.03)' }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: '9px', color: '#39ff14', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Young Generation
        </span>
        <ZoneBar label="Eden" color="#39ff14" objects={eden} capacity={12} highlight={!!gcPhase && gcPhase.includes('Eden')} />
        <div className="grid grid-cols-2 gap-2">
          <ZoneBar label="Survivor S0" color="#00d4ff" objects={s0} capacity={6} highlight={false} />
          <ZoneBar label="Survivor S1" color="#00d4ff" objects={s1} capacity={6} highlight={false} />
        </div>
      </div>

      {/* Old Gen */}
      <ZoneBar label="Old Generation (Tenured)" color="#c792ea" objects={old} capacity={18} highlight={!!gcPhase && gcPhase.includes('Old')} />

      {/* Metaspace indicator */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Metaspace (class metadata)</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>~12MB / ∞</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }}>
          Minor GCs: <span style={{ color: '#39ff14' }}>{minorGcCount}</span>
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={allocate}
          className="px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)', color: '#39ff14', fontFamily: 'Space Mono' }}>
          + Allocate Object
        </button>
        <button onClick={runMinorGC}
          className="px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontFamily: 'Space Mono' }}>
          Run Minor GC
        </button>
        <button onClick={runFullGC}
          className="px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', fontFamily: 'Space Mono' }}>
          Full GC (STW)
        </button>
        <div className="flex items-center gap-1 ml-auto">
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono' }}>Speed</span>
          <input type="range" min="0.5" max="3" step="0.5" value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-16 accent-cyan-400" />
          <span style={{ fontSize: '9px', color: '#00d4ff', fontFamily: 'JetBrains Mono' }}>{speed}x</span>
        </div>
      </div>
    </div>
  );
}
