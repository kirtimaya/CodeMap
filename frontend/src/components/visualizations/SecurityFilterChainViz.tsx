import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FILTERS = [
  { id: 'channel', name: 'ChannelProcessingFilter', desc: 'Enforces HTTPS channel' },
  { id: 'context', name: 'SecurityContextPersistenceFilter', desc: 'Load/save SecurityContext' },
  { id: 'logout', name: 'LogoutFilter', desc: 'Process logout requests' },
  { id: 'jwt', name: 'JwtAuthenticationFilter', desc: 'Parse & validate JWT token', isCustom: true },
  { id: 'basic', name: 'BasicAuthenticationFilter', desc: 'Process HTTP Basic auth' },
  { id: 'anonymous', name: 'AnonymousAuthenticationFilter', desc: 'Set anonymous if no auth' },
  { id: 'exception', name: 'ExceptionTranslationFilter', desc: 'Convert 401/403 exceptions' },
  { id: 'authorization', name: 'AuthorizationFilter', desc: 'Make authorization decision' },
];

export default function SecurityFilterChainViz() {
  const [scenario, setScenario] = useState<'valid' | 'invalid' | 'none'>('none');
  const [activeFilter, setActiveFilter] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const playRef = React.useRef(false);

  const run = async (mode: 'valid' | 'invalid') => {
    setScenario(mode);
    setPlaying(true);
    playRef.current = true;
    setActiveFilter(-1);

    const failAt = mode === 'invalid' ? 3 : -1; // fail at JWT filter for invalid

    for (let i = 0; i < FILTERS.length; i++) {
      if (!playRef.current) break;
      setActiveFilter(i);
      await new Promise((r) => setTimeout(r, 600));
      if (i === failAt) break;
    }

    setPlaying(false);
    playRef.current = false;
  };

  const stop = () => {
    playRef.current = false;
    setPlaying(false);
    setActiveFilter(-1);
    setScenario('none');
  };

  const failed = scenario === 'invalid' && activeFilter === 3 && !playing;
  const succeeded = scenario === 'valid' && activeFilter === FILTERS.length - 1 && !playing;

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: '#0a0e14', border: '1px solid rgba(0,212,255,0.15)' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#00d4ff' }}>
          Security Filter Chain
        </span>
        <div className="flex gap-2">
          <button onClick={() => playing ? stop() : run('valid')}
            className="px-3 py-1 rounded-lg text-xs"
            style={{
              background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)',
              color: '#39ff14', fontFamily: 'Space Mono',
            }}>
            {playing && scenario === 'valid' ? '■' : '▶ Valid JWT'}
          </button>
          <button onClick={() => playing ? stop() : run('invalid')}
            className="px-3 py-1 rounded-lg text-xs"
            style={{
              background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
              color: '#ff4444', fontFamily: 'Space Mono',
            }}>
            {playing && scenario === 'invalid' ? '■' : '▶ Invalid Token'}
          </button>
        </div>
      </div>

      {/* Filter chain */}
      <div className="flex flex-col gap-1">
        {FILTERS.map((f, i) => {
          const isActive = i === activeFilter;
          const isPast = i < activeFilter;
          const isFailed = scenario === 'invalid' && i === activeFilter && failed;
          const color = failed && i === activeFilter ? '#ff4444' : isActive ? '#00d4ff' : '#39ff14';

          return (
            <motion.div
              key={f.id}
              animate={{
                borderColor: isActive || isPast ? `${color}50` : 'rgba(255,255,255,0.06)',
                background: isActive ? `${color}10` : 'rgba(255,255,255,0.02)',
                boxShadow: isActive ? `0 0 10px ${color}30` : 'none',
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: isPast || isActive ? color : 'rgba(255,255,255,0.12)' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: isActive || isPast ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)' }}>
                    {f.name}
                  </span>
                  {(f as { isCustom?: boolean }).isCustom && (
                    <span className="px-1 py-0.5 rounded text-xs"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: '7px', fontFamily: 'Space Mono' }}>
                      CUSTOM
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
                  {f.desc}
                </span>
              </div>
              {isPast && !failed && <span style={{ color: '#39ff14', fontSize: '10px' }}>✓</span>}
              {isActive && failed && <span style={{ color: '#ff4444', fontSize: '10px' }}>✗</span>}
            </motion.div>
          );
        })}
      </div>

      {/* Result */}
      <AnimatePresence>
        {(failed || succeeded) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg p-3 text-center"
            style={{
              background: failed ? 'rgba(255,68,68,0.08)' : 'rgba(57,255,20,0.08)',
              border: `1px solid ${failed ? 'rgba(255,68,68,0.25)' : 'rgba(57,255,20,0.25)'}`,
            }}
          >
            <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: failed ? '#ff4444' : '#39ff14' }}>
              {failed ? '401 Unauthorized — JWT validation failed' : '✓ Request authorized — proceed to controller'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
