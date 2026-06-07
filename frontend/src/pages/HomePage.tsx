import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Brain, Zap } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

interface PlanetCardProps {
  title: string;
  subtitle: string;
  color: string;
  glowColor: string;
  orbs: string[];
  onClick: () => void;
  delay: number;
}

function PlanetCard({ title, subtitle, color, glowColor, orbs, onClick, delay }: PlanetCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 25 }}
      whileHover={{ scale: 1.04, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative p-8 rounded-2xl text-left overflow-hidden group"
      style={{
        background: 'rgba(13,17,23,0.9)',
        border: `1px solid ${glowColor}30`,
        boxShadow: `0 0 60px ${glowColor}15`,
        width: '300px',
        minHeight: '280px',
        cursor: 'pointer',
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"
        style={{ background: glowColor }}
      />

      {/* Planet visual */}
      <div className="relative flex justify-center mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute w-36 h-36 rounded-full opacity-5"
          style={{ border: `2px dashed ${color}` }}
        />
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${color}40, ${color}10)`,
            border: `2px solid ${color}50`,
            boxShadow: `0 0 30px ${color}30, inset 0 0 20px ${color}10`,
          }}
        >
          <span style={{ fontFamily: 'Space Mono', fontSize: '13px', color: color, fontWeight: 'bold' }}>
            {title.split(' ')[0].slice(0, 2)}
          </span>
        </div>

        {/* Orbiting moons */}
        {orbs.map((orb, i) => {
          const angle = (i / orbs.length) * 360;
          const r = 56;
          const x = Math.cos((angle * Math.PI) / 180) * r;
          const y = Math.sin((angle * Math.PI) / 180) * r;
          return (
            <motion.div
              key={orb}
              className="absolute w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                left: `calc(50% + ${x}px - 10px)`,
                top: `calc(50% + ${y}px - 10px)`,
                background: `${color}15`,
                border: `1px solid ${color}40`,
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              <span style={{ fontSize: '6px', color: color, fontFamily: 'Space Mono' }}>{orb.slice(0, 2)}</span>
            </motion.div>
          );
        })}
      </div>

      <h2 style={{ fontFamily: 'Space Mono', fontSize: '20px', color: color, marginBottom: '8px' }}>{title}</h2>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '16px' }}>{subtitle}</p>

      <div className="flex items-center gap-2"
        style={{ color: color, fontFamily: 'Space Mono', fontSize: '11px' }}>
        <span>Explore the map</span>
        <span>→</span>
      </div>
    </motion.button>
  );
}

const HOW_IT_WORKS = [
  {
    icon: Map,
    title: 'Explore the Map',
    desc: 'Navigate a visual concept graph. Click cluster nodes to expand their children. Drill down from high-level topics to leaf concepts.',
    color: '#00d4ff',
  },
  {
    icon: Zap,
    title: 'Understand with Visuals',
    desc: 'Each leaf concept has an interactive animation that teaches through motion. Watch a JVM heap fill, a Spring bean initialize, or a security filter chain process a request.',
    color: '#39ff14',
  },
  {
    icon: Brain,
    title: 'Test your Knowledge',
    desc: 'Open Practice Mode for any concept. Choose your difficulty level (L1–L5) and get MCQ questions or coding challenges. Track your mastery ring on the map.',
    color: '#c792ea',
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex flex-col items-center"
      style={{ background: '#080c10', paddingBottom: '80px' }}
    >
      {/* Hero */}
      <div className="flex flex-col items-center text-center pt-20 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#00d4ff' }}>Interactive Learning Platform</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-4"
          style={{ fontFamily: 'Space Mono', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.15, maxWidth: '700px' }}
        >
          <span style={{ color: '#00d4ff' }}>Navigate</span> the Universe<br />
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>of Software</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '500px', lineHeight: 1.7 }}
        >
          Explore Java internals and Spring Boot through animated concept maps.
          Visualize heap allocation, filter chains, and proxy mechanisms.
          Then test your knowledge with adaptive interview questions.
        </motion.p>
      </div>

      {/* Planet cards */}
      <div className="flex gap-8 flex-wrap justify-center px-4 mb-20">
        <PlanetCard
          title="Java"
          subtitle="JVM internals, garbage collection, concurrency, collections, and language evolution from Java 8 to 21."
          color="#00d4ff"
          glowColor="#00d4ff"
          orbs={['JVM', 'GC', 'Con', 'Col']}
          onClick={() => navigate('/java')}
          delay={0.3}
        />
        <PlanetCard
          title="Spring Boot"
          subtitle="IoC container, auto-configuration, MVC request lifecycle, Spring Security, AOP, and observability."
          color="#39ff14"
          glowColor="#39ff14"
          orbs={['IoC', 'MVC', 'Sec', 'AOP']}
          onClick={() => navigate('/springboot')}
          delay={0.45}
        />
      </div>

      {/* How it works */}
      <div className="w-full max-w-3xl px-4 mb-20">
        <h2 className="text-center mb-8" style={{ fontFamily: 'Space Mono', fontSize: '20px', color: 'rgba(255,255,255,0.8)' }}>
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="rounded-xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                <step.icon size={16} style={{ color: step.color }} />
              </div>
              <h3 style={{ fontFamily: 'Space Mono', fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interview Hub CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-xl w-full px-4 text-center"
      >
        <div className="rounded-2xl p-8"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <h2 style={{ fontFamily: 'Space Mono', fontSize: '18px', color: '#f59e0b', marginBottom: '8px' }}>
            Interview Prep Hub
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '20px' }}>
            Practice across all concepts at once. 5 difficulty levels from fundamentals to expert.
            Track your mastery across the entire Java and Spring ecosystem.
          </p>
          {/* Level diagram */}
          <div className="flex justify-center gap-2 mb-6">
            {[
              { label: 'L1', color: '#39ff14' },
              { label: 'L2', color: '#00d4ff' },
              { label: 'L3', color: '#c792ea' },
              { label: 'L4', color: '#f59e0b' },
              { label: 'L5', color: '#ff4444' },
            ].map((l, i) => (
              <div key={l.label} className="flex flex-col items-center gap-1">
                <div style={{ width: '32px', height: `${(i + 1) * 8 + 16}px`, background: `${l.color}20`, border: `1px solid ${l.color}50`, borderRadius: '4px' }} />
                <span style={{ fontFamily: 'Space Mono', fontSize: '9px', color: l.color }}>{l.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/interview')}
            className="px-6 py-3 rounded-xl transition-all"
            style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.35)',
              color: '#f59e0b',
              fontFamily: 'Space Mono',
              fontSize: '12px',
            }}
          >
            Open Interview Hub →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
