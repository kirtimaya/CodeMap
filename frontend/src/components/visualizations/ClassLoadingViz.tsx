import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADERS = [
  { name: 'Bootstrap', desc: 'java.*, javax.*, sun.*', color: '#c792ea' },
  { name: 'Platform', desc: 'java.se, jdk.* modules', color: '#f59e0b' },
  { name: 'Application', desc: 'your classpath', color: '#39ff14' },
  { name: 'Custom', desc: 'hot-swap, plugins', color: '#00d4ff' },
];

type Phase = 'idle' | 'delegating' | 'found' | 'loading' | 'done';

interface Step {
  loaderIdx: number;
  message: string;
  found: boolean;
}

function getStepsForClass(className: string): Step[] {
  const isCore = /^(java|javax|sun)\./.test(className);
  const isPlatform = /^(jdk|com\.sun)\./.test(className);

  if (isCore) {
    return [
      { loaderIdx: 3, message: 'Delegating to parent...', found: false },
      { loaderIdx: 2, message: 'Delegating to parent...', found: false },
      { loaderIdx: 1, message: 'Delegating to parent...', found: false },
      { loaderIdx: 0, message: `Found in rt.jar / bootstrap modules!`, found: true },
    ];
  }
  if (isPlatform) {
    return [
      { loaderIdx: 3, message: 'Delegating to parent...', found: false },
      { loaderIdx: 2, message: 'Delegating to parent...', found: false },
      { loaderIdx: 1, message: `Found in platform modules!`, found: true },
    ];
  }
  return [
    { loaderIdx: 3, message: 'Delegating to parent...', found: false },
    { loaderIdx: 2, message: `Found on classpath!`, found: true },
  ];
}

export default function ClassLoadingViz() {
  const [className, setClassName] = useState('java.lang.String');
  const [activeStep, setActiveStep] = useState(-1);
  const [steps, setSteps] = useState<Step[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [foundAt, setFoundAt] = useState(-1);

  const handleLoad = async () => {
    const newSteps = getStepsForClass(className);
    setSteps(newSteps);
    setPhase('delegating');
    setActiveStep(-1);
    setFoundAt(-1);

    for (let i = 0; i < newSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setActiveStep(i);
      if (newSteps[i].found) {
        setFoundAt(newSteps[i].loaderIdx);
        await new Promise((r) => setTimeout(r, 500));
        setPhase('loading');
        await new Promise((r) => setTimeout(r, 800));
        setPhase('done');
        return;
      }
    }
    setPhase('done');
  };

  const reset = () => {
    setPhase('idle');
    setActiveStep(-1);
    setSteps([]);
    setFoundAt(-1);
  };

  return (
    <div className="rounded-xl p-4 space-y-4"
      style={{ background: '#0a0e14', border: '1px solid rgba(199,146,234,0.2)' }}>
      <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#c792ea' }}>
        Class Loading Delegation
      </span>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={className}
          onChange={(e) => { setClassName(e.target.value); reset(); }}
          className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'JetBrains Mono',
          }}
          placeholder="Enter class name..."
        />
        <button
          onClick={phase === 'idle' ? handleLoad : reset}
          className="px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: phase === 'idle' ? 'rgba(199,146,234,0.15)' : 'rgba(255,68,68,0.1)',
            border: `1px solid ${phase === 'idle' ? 'rgba(199,146,234,0.4)' : 'rgba(255,68,68,0.3)'}`,
            color: phase === 'idle' ? '#c792ea' : '#ff4444',
            fontFamily: 'Space Mono',
          }}
        >
          {phase === 'idle' ? 'Load' : 'Reset'}
        </button>
      </div>

      {/* Loader chain — bottom to top (Custom is entry point) */}
      <div className="space-y-1.5">
        {[...LOADERS].reverse().map((loader, ri) => {
          const actualIdx = LOADERS.length - 1 - ri;
          const stepForThis = steps.find((s) => s.loaderIdx === actualIdx);
          const stepIdx = steps.indexOf(stepForThis!);
          const isActive = stepIdx !== -1 && stepIdx <= activeStep;
          const isFound = foundAt === actualIdx;

          return (
            <motion.div
              key={loader.name}
              animate={{
                borderColor: isFound ? loader.color : isActive ? `${loader.color}66` : 'rgba(255,255,255,0.06)',
                boxShadow: isFound ? `0 0 12px ${loader.color}44` : 'none',
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{
                background: isFound ? `${loader.color}10` : isActive ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: isFound || isActive ? loader.color : 'rgba(255,255,255,0.15)' }} />
                <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: isFound ? loader.color : 'rgba(255,255,255,0.7)' }}>
                  {loader.name} ClassLoader
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono' }}>
                {loader.desc}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        {phase !== 'idle' && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-2 rounded-lg"
            style={{
              background: phase === 'done' ? 'rgba(57,255,20,0.08)' : 'rgba(0,212,255,0.06)',
              border: `1px solid ${phase === 'done' ? 'rgba(57,255,20,0.2)' : 'rgba(0,212,255,0.15)'}`,
            }}
          >
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: phase === 'done' ? '#39ff14' : '#00d4ff' }}>
              {phase === 'delegating' && steps[activeStep]?.message}
              {phase === 'loading' && `Loading ${className} into Metaspace...`}
              {phase === 'done' && `✓ Class ${className} loaded successfully`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
        Try: java.lang.String · com.example.MyClass · jdk.internal.Foo
      </div>
    </div>
  );
}
