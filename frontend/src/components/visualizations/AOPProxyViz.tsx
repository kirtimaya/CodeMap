import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ProxyType = 'jdk' | 'cglib';

interface CallStep {
  label: string;
  side: 'proxy' | 'target' | 'advice';
  phase: 'before' | 'during' | 'after';
}

const STEPS: CallStep[] = [
  { label: 'Client calls method', side: 'proxy', phase: 'before' },
  { label: '@Before advice runs', side: 'advice', phase: 'before' },
  { label: 'Proxy delegates to target', side: 'proxy', phase: 'during' },
  { label: 'Target method executes', side: 'target', phase: 'during' },
  { label: 'Return value bubbles back', side: 'proxy', phase: 'after' },
  { label: '@AfterReturning advice runs', side: 'advice', phase: 'after' },
  { label: 'Response returned to client', side: 'proxy', phase: 'after' },
];

export default function AOPProxyViz() {
  const [proxyType, setProxyType] = useState<ProxyType>('cglib');
  const [activeStep, setActiveStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const playRef = React.useRef(false);

  const play = async () => {
    setPlaying(true);
    playRef.current = true;
    for (let i = 0; i < STEPS.length; i++) {
      if (!playRef.current) break;
      setActiveStep(i);
      await new Promise((r) => setTimeout(r, 700));
    }
    setPlaying(false);
    playRef.current = false;
  };

  const stop = () => {
    playRef.current = false;
    setPlaying(false);
    setActiveStep(-1);
  };

  const step = STEPS[activeStep];
  const phaseColor = step?.phase === 'before' ? '#00d4ff' : step?.phase === 'during' ? '#39ff14' : '#f59e0b';

  return (
    <div className="rounded-xl p-4 space-y-4"
      style={{ background: '#0a0e14', border: '1px solid rgba(199,146,234,0.2)' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#c792ea' }}>AOP Proxy Mechanism</span>
        <div className="flex items-center gap-2">
          {/* Proxy type toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {(['jdk', 'cglib'] as ProxyType[]).map((t) => (
              <button key={t} onClick={() => { setProxyType(t); stop(); }}
                className="px-3 py-1 text-xs"
                style={{
                  background: proxyType === t ? 'rgba(199,146,234,0.2)' : 'transparent',
                  color: proxyType === t ? '#c792ea' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'Space Mono',
                }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={playing ? stop : play}
            className="px-3 py-1 rounded-lg text-xs"
            style={{
              background: playing ? 'rgba(255,68,68,0.1)' : 'rgba(199,146,234,0.1)',
              border: `1px solid ${playing ? 'rgba(255,68,68,0.3)' : 'rgba(199,146,234,0.3)'}`,
              color: playing ? '#ff4444' : '#c792ea',
              fontFamily: 'Space Mono',
            }}>
            {playing ? '■ Stop' : '▶ Call Method'}
          </button>
        </div>
      </div>

      {/* Proxy type explanation */}
      <div className="rounded-lg px-3 py-2"
        style={{ background: 'rgba(199,146,234,0.05)', border: '1px solid rgba(199,146,234,0.1)' }}>
        {proxyType === 'jdk' ? (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            <span style={{ color: '#c792ea' }}>JDK Dynamic Proxy</span> — wraps an interface. The target must implement at least one interface. Generated with <code style={{ fontFamily: 'JetBrains Mono', color: '#39ff14' }}>Proxy.newProxyInstance()</code>.
          </p>
        ) : (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            <span style={{ color: '#c792ea' }}>CGLIB Proxy</span> — creates a subclass of the target class. Works without interfaces. Spring Boot default. Cannot proxy <code style={{ fontFamily: 'JetBrains Mono', color: '#f59e0b' }}>final</code> classes or methods.
          </p>
        )}
      </div>

      {/* Side-by-side boxes */}
      <div className="grid grid-cols-3 gap-2">
        {/* Proxy */}
        <motion.div
          animate={{ borderColor: step?.side === 'proxy' ? '#c792ea' : 'rgba(199,146,234,0.15)', boxShadow: step?.side === 'proxy' ? '0 0 12px rgba(199,146,234,0.3)' : 'none' }}
          className="rounded-lg p-3"
          style={{ border: '1px solid rgba(199,146,234,0.15)', background: 'rgba(199,146,234,0.05)' }}
        >
          <div style={{ fontFamily: 'Space Mono', fontSize: '10px', color: '#c792ea', marginBottom: '4px' }}>
            {proxyType === 'jdk' ? 'JDK Proxy$0' : `${proxyType === 'cglib' ? 'Bean$$CGLIB' : 'Proxy'}`}
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }}>
            {proxyType === 'jdk' ? 'implements Interface' : 'extends TargetBean'}
          </div>
        </motion.div>

        {/* Advice */}
        <motion.div
          animate={{ borderColor: step?.side === 'advice' ? '#f59e0b' : 'rgba(245,158,11,0.15)', boxShadow: step?.side === 'advice' ? '0 0 12px rgba(245,158,11,0.3)' : 'none' }}
          className="rounded-lg p-3"
          style={{ border: '1px solid rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.05)' }}
        >
          <div style={{ fontFamily: 'Space Mono', fontSize: '10px', color: '#f59e0b', marginBottom: '4px' }}>@Around Advice</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }}>
            @Transactional<br />@Cacheable<br />@Async
          </div>
        </motion.div>

        {/* Target */}
        <motion.div
          animate={{ borderColor: step?.side === 'target' ? '#39ff14' : 'rgba(57,255,20,0.15)', boxShadow: step?.side === 'target' ? '0 0 12px rgba(57,255,20,0.3)' : 'none' }}
          className="rounded-lg p-3"
          style={{ border: '1px solid rgba(57,255,20,0.15)', background: 'rgba(57,255,20,0.05)' }}
        >
          <div style={{ fontFamily: 'Space Mono', fontSize: '10px', color: '#39ff14', marginBottom: '4px' }}>Target Bean</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }}>actual logic</div>
        </motion.div>
      </div>

      {/* Call steps */}
      <div className="space-y-1">
        {STEPS.map((s, i) => {
          const isActive = i === activeStep;
          const isPast = i < activeStep;
          const sColor = s.phase === 'before' ? '#00d4ff' : s.phase === 'during' ? '#39ff14' : '#f59e0b';
          return (
            <motion.div key={i}
              animate={{ opacity: isActive || isPast ? 1 : 0.35, x: isActive ? 4 : 0 }}
              className="flex items-center gap-2 px-2 py-1 rounded"
              style={{ background: isActive ? `${sColor}0d` : 'transparent' }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: isActive || isPast ? sColor : 'rgba(255,255,255,0.15)' }} />
              <span style={{ fontSize: '10px', color: isActive ? sColor : 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono' }}>
                {i + 1}. {s.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
