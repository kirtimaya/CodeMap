import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ChevronRight, ChevronLeft, SkipForward, Sparkles } from 'lucide-react';
import type { ConceptNode } from '../../types';

// ── Speaking waveform ────────────────────────────────────────────────────────

function SpeakingWave({ active }: { active: boolean }) {
  const heights = [0.45, 0.75, 1, 0.75, 0.45, 0.6, 0.9, 0.6, 0.45];
  return (
    <div className="flex items-center gap-[2px]">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          animate={active ? { scaleY: [h, h * 2.8, h * 0.5, h * 2.2, h] } : { scaleY: h * 0.6 }}
          transition={
            active
              ? { duration: 0.8 + i * 0.06, repeat: Infinity, delay: i * 0.07, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
          className="rounded-full"
          style={{
            width: '2px',
            height: '14px',
            background: active
              ? `hsl(${190 + i * 4}, 100%, 60%)`
              : 'rgba(255,255,255,0.15)',
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  );
}

// ── Instructor avatar ────────────────────────────────────────────────────────

function InstructorAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div className="relative flex-shrink-0 w-12 h-12">
      {/* Outer pulse rings */}
      {[1, 1.6].map((scale, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, scale], opacity: [0.35, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border border-cyan-400"
        />
      ))}

      {/* Rotating conic-gradient border */}
      <motion.div
        animate={{ rotate: speaking ? 360 : 0 }}
        transition={{ duration: speaking ? 2.5 : 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #00d4ff, #c792ea, #39ff14, #f59e0b, #00d4ff)',
          padding: '2px',
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1525 100%)' }}
        >
          <motion.div
            animate={speaking ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.9, repeat: Infinity }}
          >
            <GraduationCap size={18} style={{ color: '#00d4ff' }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Live indicator */}
      <motion.div
        animate={{ opacity: speaking ? 1 : 0.5 }}
        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: speaking ? '#39ff14' : '#555', border: '1.5px solid #080c10' }}
      >
        <motion.div
          animate={speaking ? { scale: [1, 1.5, 1] } : {}}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#080c10' }}
        />
      </motion.div>
    </div>
  );
}

// ── Stage builder ─────────────────────────────────────────────────────────────

interface Stage {
  label: string;
  text: string;
}

function buildStages(concept: ConceptNode): Stage[] {
  const stages: Stage[] = [
    { label: 'Introduction', text: concept.content.overview },
    ...concept.content.sections.map((s) => ({
      label: s.heading,
      text: s.codeSnippet
        ? `${s.body}\n\nExample (${s.codeSnippet.language}):\n\`\`\`\n${s.codeSnippet.code}\n\`\`\``
        : s.body,
    })),
  ];

  if (concept.content.keyInsights.length > 0) {
    stages.push({
      label: 'Key Takeaways',
      text: concept.content.keyInsights.map((ins) => `• ${ins}`).join('\n\n'),
    });
  }

  return stages;
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  concept: ConceptNode;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 32, opacity: 0, filter: 'blur(4px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
  exit: (dir: number) => ({ x: dir * -32, opacity: 0, filter: 'blur(4px)', transition: { duration: 0.2 } }),
};

export function InstructorPanel({ concept }: Props) {
  const stages = buildStages(concept);
  const [stageIdx, setStageIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [startDelay, setStartDelay] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStage = stages[Math.min(stageIdx, stages.length - 1)];

  // Small delay before starting to type each new section (instructor "thinking")
  useEffect(() => {
    setDisplayText('');
    setIsTyping(false);
    setStartDelay(true);

    const delay = setTimeout(() => {
      setStartDelay(false);
      setIsTyping(true);
      let i = 0;
      const full = currentStage.text;

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        i++;
        setDisplayText(full.slice(0, i));
        if (i >= full.length) {
          clearInterval(intervalRef.current!);
          setIsTyping(false);
        }
      }, 9);
    }, 500);

    return () => {
      clearTimeout(delay);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stageIdx, concept.id]);

  const skip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(currentStage.text);
    setIsTyping(false);
    setStartDelay(false);
  };

  const goNext = () => {
    if (stageIdx < stages.length - 1) {
      setDirection(1);
      setStageIdx((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (stageIdx > 0) {
      setDirection(-1);
      setStageIdx((i) => i - 1);
    }
  };

  const isSpeaking = isTyping || startDelay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,18,35,0.9) 0%, rgba(10,8,28,0.9) 100%)',
        border: '1px solid rgba(0,212,255,0.25)',
        boxShadow: '0 0 40px rgba(0,212,255,0.1), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}
    >
      {/* Shimmer top border */}
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.6), rgba(199,146,234,0.4), transparent)',
        }}
      />

      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <InstructorAvatar speaking={isSpeaking} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#00d4ff' }}>
              AI Instructor
            </span>
            <SpeakingWave active={isSpeaking} />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={stageIdx}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)', fontFamily: 'Space Mono' }}
            >
              {currentStage.label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {stages.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > stageIdx ? 1 : -1);
                setStageIdx(i);
              }}
              title={stages[i].label}
            >
              <motion.div
                animate={{
                  scale: i === stageIdx ? 1.3 : 0.9,
                  opacity: i <= stageIdx ? 1 : 0.3,
                }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="rounded-full"
                style={{
                  width: '6px',
                  height: '6px',
                  background:
                    i === stageIdx
                      ? '#00d4ff'
                      : i < stageIdx
                        ? 'rgba(0,212,255,0.5)'
                        : 'rgba(255,255,255,0.15)',
                  boxShadow: i === stageIdx ? '0 0 6px #00d4ff' : 'none',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Speech bubble */}
      <div className="px-4 py-3">
        <div
          className="relative rounded-xl p-3.5"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
            minHeight: '80px',
          }}
        >
          {startDelay ? (
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#00d4ff' }}
                />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.p
                key={stageIdx}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.84)',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'IBM Plex Sans',
                }}
              >
                {displayText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.55, repeat: Infinity }}
                    className="inline-block align-middle ml-0.5 rounded-sm"
                    style={{ width: '6px', height: '14px', background: '#00d4ff', verticalAlign: 'text-bottom' }}
                  />
                )}
              </motion.p>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Controls */}
      <div
        className="flex items-center justify-between px-4 pb-4 pt-0"
      >
        {/* Prev */}
        <button
          onClick={goPrev}
          disabled={stageIdx === 0}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: stageIdx === 0 ? 'transparent' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${stageIdx === 0 ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
            color: stageIdx === 0 ? 'transparent' : 'rgba(255,255,255,0.45)',
            fontFamily: 'Space Mono',
            cursor: stageIdx === 0 ? 'default' : 'pointer',
          }}
        >
          <ChevronLeft size={11} />
          Prev
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isSpeaking && (
              <motion.button
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                onClick={skip}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'Space Mono',
                }}
              >
                <SkipForward size={10} />
                Skip
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isSpeaking && stageIdx < stages.length - 1 && (
              <motion.button
                key="next"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={goNext}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                style={{
                  background: 'rgba(0,212,255,0.14)',
                  border: '1px solid rgba(0,212,255,0.38)',
                  color: '#00d4ff',
                  fontFamily: 'Space Mono',
                  boxShadow: '0 0 16px rgba(0,212,255,0.18)',
                }}
              >
                Next
                <ChevronRight size={11} />
              </motion.button>
            )}
            {!isSpeaking && stageIdx === stages.length - 1 && (
              <motion.div
                key="done"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{
                  background: 'rgba(57,255,20,0.08)',
                  border: '1px solid rgba(57,255,20,0.28)',
                  color: '#39ff14',
                  fontFamily: 'Space Mono',
                }}
              >
                <Sparkles size={10} />
                Complete
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
