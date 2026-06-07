import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHASES = [
  { id: 'instantiate', label: 'Instantiation', sub: 'constructor()', color: '#c792ea', detail: 'The container calls the constructor (or factory method). Dependencies not yet injected.' },
  { id: 'inject', label: 'Inject Dependencies', sub: '@Autowired / constructor', color: '#00d4ff', detail: 'Properties and dependencies are set via constructor, setter, or field injection.' },
  { id: 'aware', label: 'Aware Callbacks', sub: 'BeanNameAware, ApplicationContextAware', color: '#39ff14', detail: 'Spring calls Aware interface methods to give the bean its name, factory, and context references.' },
  { id: 'bpp_before', label: 'BPP Before Init', sub: 'postProcessBeforeInitialization()', color: '#f59e0b', detail: 'All BeanPostProcessors run. @Required validation, @Autowired processing happen here.' },
  { id: 'postconstruct', label: '@PostConstruct', sub: 'init callback', color: '#39ff14', detail: 'Your custom initialization logic runs. Validate config, warm caches, open connections here.' },
  { id: 'bpp_after', label: 'BPP After Init', sub: 'postProcessAfterInitialization()', color: '#f59e0b', detail: 'AOP proxy wrapping happens here! This is why @Transactional, @Async, @Cacheable work.' },
  { id: 'ready', label: 'Bean Ready', sub: 'in service', color: '#39ff14', detail: 'The bean is fully initialized and ready to handle requests. All AOP advice is active.' },
  { id: 'predestroy', label: '@PreDestroy', sub: 'on context close', color: '#ff4444', detail: 'Cleanup logic runs when context closes. Release resources, unregister listeners, flush caches.' },
  { id: 'destroyed', label: 'Destroyed', sub: 'GC eligible', color: '#ff4444', detail: 'The bean is dereferenced by the container. If no external references, the GC can collect it.' },
];

export default function SpringBeanLifecycleViz() {
  const [activePhase, setActivePhase] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const playRef = React.useRef(false);

  const play = async () => {
    setPlaying(true);
    playRef.current = true;
    for (let i = 0; i <= PHASES.length - 1; i++) {
      if (!playRef.current) break;
      setActivePhase(i);
      await new Promise((r) => setTimeout(r, 900));
    }
    setPlaying(false);
    playRef.current = false;
  };

  const stop = () => {
    playRef.current = false;
    setPlaying(false);
    setActivePhase(-1);
  };

  const phase = PHASES[activePhase];

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: '#0a0e14', border: '1px solid rgba(57,255,20,0.15)' }}>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#39ff14' }}>
          Spring Bean Lifecycle
        </span>
        <div className="flex gap-2">
          <button onClick={playing ? stop : play}
            className="px-3 py-1 rounded-lg text-xs"
            style={{
              background: playing ? 'rgba(255,68,68,0.1)' : 'rgba(57,255,20,0.1)',
              border: `1px solid ${playing ? 'rgba(255,68,68,0.3)' : 'rgba(57,255,20,0.3)'}`,
              color: playing ? '#ff4444' : '#39ff14',
              fontFamily: 'Space Mono',
            }}>
            {playing ? '■ Stop' : '▶ Animate'}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-1">
        {PHASES.map((p, i) => {
          const isActive = i === activePhase;
          const isPast = i < activePhase;
          return (
            <motion.button
              key={p.id}
              onClick={() => setActivePhase(i === activePhase ? -1 : i)}
              animate={{
                opacity: activePhase === -1 || isActive || isPast ? 1 : 0.5,
                x: isActive ? 4 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left w-full transition-all"
              style={{
                background: isActive ? `${p.color}15` : isPast ? 'rgba(255,255,255,0.02)' : 'transparent',
                border: isActive ? `1px solid ${p.color}50` : '1px solid transparent',
              }}
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.div
                  animate={{
                    background: isActive ? p.color : isPast ? `${p.color}60` : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 0 8px ${p.color}80` : 'none',
                  }}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                />
                {i < PHASES.length - 1 && (
                  <div className="w-px h-3 -mb-1 -mt-1 ml-[3px]"
                    style={{ background: isPast ? `${PHASES[i].color}50` : 'rgba(255,255,255,0.08)', position: 'absolute', marginTop: '18px' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: isActive ? p.color : isPast ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)' }}>
                    {p.label}
                  </span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                  {p.sub}
                </span>
              </div>
              {isPast && !isActive && (
                <span style={{ fontSize: '10px', color: p.color }}>✓</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Detail card */}
      <AnimatePresence mode="wait">
        {phase && (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-lg p-3"
            style={{
              background: `${phase.color}08`,
              border: `1px solid ${phase.color}25`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: phase.color }} />
              <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: phase.color }}>{phase.label}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
              {phase.detail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
