import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PIPELINE_STEPS = [
  { id: 'request', label: 'HTTP Request', sub: 'GET /api/users/42', color: '#00d4ff', isFilter: false },
  { id: 'filter', label: 'Filter Chain', sub: 'CORS, Security, Logging', color: '#f59e0b', isFilter: true },
  { id: 'dispatcher', label: 'DispatcherServlet', sub: 'doDispatch()', color: '#c792ea', isFilter: false },
  { id: 'handler-mapping', label: 'HandlerMapping', sub: 'finds @GetMapping("/users/{id}")', color: '#39ff14', isFilter: false },
  { id: 'interceptor', label: 'HandlerInterceptor', sub: 'preHandle()', color: '#f59e0b', isFilter: false },
  { id: 'adapter', label: 'HandlerAdapter', sub: 'binds @PathVariable, @RequestBody', color: '#00d4ff', isFilter: false },
  { id: 'controller', label: '@RestController', sub: 'UserController.getUser(42)', color: '#39ff14', isFilter: false },
  { id: 'service', label: 'Service Layer', sub: 'userService.findById(42)', color: '#c792ea', isFilter: false },
  { id: 'converter', label: 'HttpMessageConverter', sub: 'Jackson serializes to JSON', color: '#00d4ff', isFilter: false },
  { id: 'response', label: 'HTTP Response', sub: '200 OK { "id": 42, ... }', color: '#39ff14', isFilter: false },
];

export default function DispatcherServletViz() {
  const [activeStep, setActiveStep] = useState(-1);
  const [showFilters, setShowFilters] = useState(true);
  const [playing, setPlaying] = useState(false);
  const playRef = React.useRef(false);

  const visibleSteps = showFilters ? PIPELINE_STEPS : PIPELINE_STEPS.filter((s) => !s.isFilter);

  const play = async () => {
    setPlaying(true);
    playRef.current = true;
    setActiveStep(-1);
    for (let i = 0; i < visibleSteps.length; i++) {
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

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: '#0a0e14', border: '1px solid rgba(0,212,255,0.15)' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#00d4ff' }}>
          Spring MVC Request Lifecycle
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showFilters} onChange={(e) => { setShowFilters(e.target.checked); setActiveStep(-1); }}
              className="accent-amber-400 w-3 h-3" />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Space Mono' }}>Show Filters</span>
          </label>
          <button onClick={playing ? stop : play}
            className="px-3 py-1 rounded-lg text-xs"
            style={{
              background: playing ? 'rgba(255,68,68,0.1)' : 'rgba(0,212,255,0.1)',
              border: `1px solid ${playing ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,255,0.3)'}`,
              color: playing ? '#ff4444' : '#00d4ff',
              fontFamily: 'Space Mono',
            }}>
            {playing ? '■ Stop' : '▶ Send Request'}
          </button>
        </div>
      </div>

      {/* Pipeline */}
      <div className="flex flex-col gap-1.5 relative">
        {/* Animated packet */}
        {activeStep >= 0 && (
          <motion.div
            key={`packet-${activeStep}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-2 w-4 h-4 rounded-full z-10"
            style={{
              background: '#00d4ff',
              boxShadow: '0 0 10px rgba(0,212,255,0.6)',
              top: `${activeStep * 40 + 12}px`,
              transition: 'top 0.4s ease',
            }}
          />
        )}

        {visibleSteps.map((step, i) => {
          const isActive = i === activeStep;
          const isPast = i < activeStep;
          return (
            <motion.div
              key={step.id}
              onClick={() => setActiveStep(i === activeStep ? -1 : i)}
              animate={{
                borderColor: isActive ? step.color : isPast ? `${step.color}40` : 'rgba(255,255,255,0.06)',
                background: isActive ? `${step.color}12` : 'rgba(255,255,255,0.02)',
                boxShadow: isActive ? `0 0 12px ${step.color}30` : 'none',
              }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: isActive || isPast ? step.color : 'rgba(255,255,255,0.15)' }} />
              <div className="flex-1 min-w-0">
                <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: isActive ? step.color : isPast ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}>
                  {step.label}
                </span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'rgba(255,255,255,0.3)', textAlign: 'right', maxWidth: '140px' }}>
                {step.sub}
              </span>
              {step.isFilter && (
                <span className="px-1.5 py-0.5 rounded text-xs flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '8px', fontFamily: 'Space Mono' }}>
                  FILTER
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
