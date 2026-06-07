import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Brain, Zap, ArrowRight, Cpu, Layers } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

// ── Floating particles ────────────────────────────────────────────────────────

const COLORS = ['#00d4ff', '#c792ea', '#39ff14', '#f59e0b'];

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        color: COLORS[i % COLORS.length],
        duration: Math.random() * 12 + 8,
        delay: Math.random() * 6,
        dx: (Math.random() - 0.5) * 14,
        dy: (Math.random() - 0.5) * 14,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}80`,
          }}
          animate={{
            x: [0, p.dx, 0],
            y: [0, p.dy, 0],
            opacity: [0.15, 0.55, 0.15],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Planet card ───────────────────────────────────────────────────────────────

interface PlanetCardProps {
  title: string;
  subtitle: string;
  color: string;
  glowColor: string;
  orbs: { label: string; icon: string }[];
  features: string[];
  onClick: () => void;
  delay: number;
}

function PlanetCard({ title, subtitle, color, glowColor, orbs, features, onClick, delay }: PlanetCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.88, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 180, damping: 22 }}
      whileHover={{ scale: 1.035, y: -4, transition: { type: 'spring', stiffness: 380, damping: 26 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative text-left overflow-hidden group"
      style={{
        background: 'linear-gradient(145deg, rgba(13,17,23,0.95) 0%, rgba(8,12,18,0.98) 100%)',
        border: `1px solid ${glowColor}22`,
        borderRadius: '20px',
        width: '310px',
        padding: '28px',
        cursor: 'pointer',
        boxShadow: `0 8px 40px ${glowColor}12, 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Top shimmer border */}
      <div
        className="absolute top-0 left-6 right-6 h-px rounded-full opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Hover glow bloom */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${glowColor}12 0%, transparent 70%)`,
        }}
      />

      {/* Planet visual */}
      <div className="relative flex justify-center mb-7">
        {/* Orbit ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full"
          style={{
            width: '130px',
            height: '130px',
            border: `1px dashed ${color}28`,
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full"
          style={{
            width: '100px',
            height: '100px',
            border: `1px solid ${color}15`,
          }}
        />

        {/* Planet sphere */}
        <div
          className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${color}35, ${color}08)`,
            border: `1.5px solid ${color}45`,
            boxShadow: `0 0 30px ${color}28, 0 0 60px ${color}10, inset 0 0 20px ${color}08`,
          }}
        >
          {/* Surface sheen */}
          <div
            className="absolute inset-1 rounded-full opacity-30"
            style={{
              background: `linear-gradient(135deg, ${color}30 0%, transparent 60%)`,
            }}
          />
          <span
            style={{
              fontFamily: 'Space Mono',
              fontSize: '14px',
              color,
              fontWeight: 'bold',
              position: 'relative',
              textShadow: `0 0 12px ${color}`,
            }}
          >
            {title.split(' ')[0].slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Orbiting moons */}
        {orbs.map((orb, i) => {
          const angle = (i / orbs.length) * 360 - 45;
          const r = 58;
          const x = Math.cos((angle * Math.PI) / 180) * r;
          const y = Math.sin((angle * Math.PI) / 180) * r;
          return (
            <motion.div
              key={orb.label}
              className="absolute flex items-center justify-center rounded-full"
              style={{
                width: '24px',
                height: '24px',
                left: `calc(50% + ${x}px - 12px)`,
                top: `calc(50% + ${y}px - 12px)`,
                background: `${color}12`,
                border: `1px solid ${color}35`,
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            >
              <span style={{ fontSize: '7px', color, fontFamily: 'Space Mono' }}>{orb.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Text */}
      <h2
        style={{
          fontFamily: 'Space Mono',
          fontSize: '20px',
          marginBottom: '8px',
          color: 'rgba(255,255,255,0.92)',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.65,
          marginBottom: '16px',
        }}
      >
        {subtitle}
      </p>

      {/* Feature chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {features.map((f) => (
          <span
            key={f}
            className="px-2 py-0.5 rounded-full"
            style={{
              fontSize: '9px',
              background: `${color}10`,
              border: `1px solid ${color}25`,
              color: `${color}cc`,
              fontFamily: 'Space Mono',
            }}
          >
            {f}
          </span>
        ))}
      </div>

      <div
        className="flex items-center gap-2"
        style={{ color, fontFamily: 'Space Mono', fontSize: '11px' }}
      >
        <span>Explore the map</span>
        <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ArrowRight size={13} />
        </motion.span>
      </div>
    </motion.button>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    icon: Map,
    number: '01',
    title: 'Explore the Map',
    desc: 'Navigate a visual concept graph. Click cluster nodes to expand their children. Drill down from high-level topics to leaf concepts.',
    color: '#00d4ff',
  },
  {
    icon: Zap,
    number: '02',
    title: 'Understand with Visuals',
    desc: 'Each leaf concept has an interactive animation. Watch a JVM heap fill, a Spring bean initialize, or a security filter chain process a request.',
    color: '#39ff14',
  },
  {
    icon: Brain,
    number: '03',
    title: 'Test your Knowledge',
    desc: 'Open Practice Mode for any concept. Choose difficulty L1–L5, get MCQ or coding challenges. Instructor Mode walks you through each concept step-by-step.',
    color: '#c792ea',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex flex-col items-center relative"
      style={{ paddingBottom: '80px' }}
    >
      <FloatingParticles />

      {/* Hero */}
      <div className="flex flex-col items-center text-center pt-20 pb-14 px-4 relative">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{
            background: 'rgba(0,212,255,0.07)',
            border: '1px solid rgba(0,212,255,0.22)',
            boxShadow: '0 0 20px rgba(0,212,255,0.08)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
          />
          <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: '#00d4ff' }}>
            Interactive Learning Platform
          </span>
          <Cpu size={10} style={{ color: '#00d4ff', opacity: 0.6 }} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55 }}
          className="mb-5"
          style={{
            fontFamily: 'Space Mono',
            fontSize: 'clamp(30px, 5.5vw, 58px)',
            lineHeight: 1.12,
            maxWidth: '720px',
          }}
        >
          <motion.span
            style={{
              display: 'inline-block',
              background: 'linear-gradient(90deg, #00d4ff, #c792ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            Navigate
          </motion.span>{' '}
          <span style={{ color: 'rgba(255,255,255,0.88)' }}>the Universe</span>
          <br />
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>of Software Engineering</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: '520px',
            lineHeight: 1.75,
          }}
        >
          Explore Java internals and Spring Boot through animated concept maps. Visualize heap
          allocation, filter chains, and proxy mechanisms — then test your knowledge with adaptive
          interview questions.
        </motion.p>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 mt-6"
          style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontFamily: 'Space Mono' }}
        >
          <Layers size={11} />
          <span>2 learning tracks · 5 difficulty levels · Instructor Mode</span>
        </motion.div>
      </div>

      {/* Planet cards */}
      <div className="flex gap-8 flex-wrap justify-center px-4 mb-20 relative">
        <PlanetCard
          title="Java"
          subtitle="JVM internals, garbage collection, concurrency, collections, and language evolution from Java 8 to 21."
          color="#00d4ff"
          glowColor="#00d4ff"
          orbs={[
            { label: 'JVM', icon: '☕' },
            { label: 'GC', icon: '♻' },
            { label: 'Con', icon: '⚡' },
            { label: 'Col', icon: '📦' },
          ]}
          features={['JVM Internals', 'Concurrency', 'Streams', 'Virtual Threads']}
          onClick={() => navigate('/java')}
          delay={0.3}
        />
        <PlanetCard
          title="Spring Boot"
          subtitle="IoC container, auto-configuration, MVC request lifecycle, Spring Security, AOP, and observability."
          color="#39ff14"
          glowColor="#39ff14"
          orbs={[
            { label: 'IoC', icon: '🔄' },
            { label: 'MVC', icon: '🌐' },
            { label: 'Sec', icon: '🔒' },
            { label: 'AOP', icon: '🎯' },
          ]}
          features={['IoC Container', 'Auto-Config', 'Spring Security', 'AOP']}
          onClick={() => navigate('/springboot')}
          delay={0.42}
        />
      </div>

      {/* How it works */}
      <div className="w-full max-w-3xl px-4 mb-20 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8"
        >
          <h2
            style={{
              fontFamily: 'Space Mono',
              fontSize: '18px',
              color: 'rgba(255,255,255,0.75)',
              marginBottom: '4px',
            }}
          >
            How it works
          </h2>
          <div
            className="mx-auto mt-2 h-px w-24"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)' }}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Connecting line (desktop only) */}
          <div
            className="absolute top-10 left-1/6 right-1/6 h-px hidden md:block pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
          />

          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 + i * 0.1, type: 'spring', stiffness: 200, damping: 24 }}
              className="rounded-2xl p-5 group relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${step.color}0d 0%, transparent 70%)`,
                }}
              />

              {/* Number + icon */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${step.color}12`,
                    border: `1px solid ${step.color}28`,
                  }}
                >
                  <step.icon size={15} style={{ color: step.color }} />
                </div>
                <span
                  style={{
                    fontFamily: 'Space Mono',
                    fontSize: '20px',
                    color: `${step.color}28`,
                    fontWeight: 'bold',
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'Space Mono',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.88)',
                  marginBottom: '8px',
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interview Hub CTA */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.82, type: 'spring', stiffness: 180, damping: 22 }}
        className="max-w-xl w-full px-4 text-center relative"
      >
        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(245,158,11,0.03) 100%)',
            border: '1px solid rgba(245,158,11,0.22)',
            boxShadow: '0 0 40px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Amber shimmer top */}
          <div
            className="absolute top-0 left-8 right-8 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)',
            }}
          />

          <h2
            style={{
              fontFamily: 'Space Mono',
              fontSize: '18px',
              color: '#f59e0b',
              marginBottom: '8px',
              textShadow: '0 0 20px rgba(245,158,11,0.3)',
            }}
          >
            Interview Prep Hub
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.7,
              marginBottom: '20px',
            }}
          >
            Practice across all concepts at once. 5 difficulty levels from fundamentals to expert.
            Track your mastery across the entire Java and Spring ecosystem.
          </p>

          {/* Difficulty bars */}
          <div className="flex justify-center gap-2 mb-6">
            {[
              { label: 'L1', color: '#39ff14' },
              { label: 'L2', color: '#00d4ff' },
              { label: 'L3', color: '#c792ea' },
              { label: 'L4', color: '#f59e0b' },
              { label: 'L5', color: '#ff4444' },
            ].map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.9 + i * 0.07, type: 'spring', stiffness: 300 }}
                className="flex flex-col items-center gap-1"
                style={{ transformOrigin: 'bottom' }}
              >
                <div
                  style={{
                    width: '30px',
                    height: `${(i + 1) * 9 + 12}px`,
                    background: `${l.color}18`,
                    border: `1px solid ${l.color}45`,
                    borderRadius: '5px',
                    boxShadow: `0 0 8px ${l.color}20`,
                  }}
                />
                <span style={{ fontFamily: 'Space Mono', fontSize: '9px', color: l.color }}>
                  {l.label}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.button
            onClick={() => navigate('/interview')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-7 py-3 rounded-xl relative overflow-hidden group"
            style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.38)',
              color: '#f59e0b',
              fontFamily: 'Space Mono',
              fontSize: '12px',
              boxShadow: '0 0 20px rgba(245,158,11,0.12)',
            }}
          >
            Open Interview Hub
            <ArrowRight size={13} className="inline ml-2" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
