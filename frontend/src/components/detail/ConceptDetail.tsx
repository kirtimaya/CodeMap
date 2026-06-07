import React, { lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Star, BookOpen, ChevronRight } from 'lucide-react';
import type { ConceptNode } from '../../types';
import { useConceptStore } from '../../store/conceptStore';
import { useProgressStore } from '../../store/progressStore';
import { useTestStore } from '../../store/testStore';
import { useInstructorStore } from '../../store/instructorStore';
import { CodeBlock } from '../ui/CodeBlock';
import { InstructorPanel } from '../instructor/InstructorPanel';

const JVMHeapViz = lazy(() => import('../visualizations/JVMHeapViz'));
const ClassLoadingViz = lazy(() => import('../visualizations/ClassLoadingViz'));
const SpringBeanLifecycleViz = lazy(() => import('../visualizations/SpringBeanLifecycleViz'));
const DispatcherServletViz = lazy(() => import('../visualizations/DispatcherServletViz'));
const ThreadStateViz = lazy(() => import('../visualizations/ThreadStateViz'));
const VirtualThreadViz = lazy(() => import('../visualizations/VirtualThreadViz'));
const SecurityFilterChainViz = lazy(() => import('../visualizations/SecurityFilterChainViz'));
const AOPProxyViz = lazy(() => import('../visualizations/AOPProxyViz'));

const VIZ_MAP: Record<string, React.ComponentType> = {
  JVMHeapViz,
  ClassLoadingViz,
  SpringBeanLifecycleViz,
  DispatcherServletViz,
  ThreadStateViz,
  VirtualThreadViz,
  SecurityFilterChainViz,
  AOPProxyViz,
};

function VizPlaceholder() {
  return (
    <div
      className="flex items-center justify-center h-48 rounded-xl"
      style={{ border: '1px dashed rgba(0,212,255,0.18)', background: 'rgba(0,212,255,0.02)' }}
    >
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontFamily: 'Space Mono' }}>
          Loading visualization...
        </span>
      </div>
    </div>
  );
}

function RelevanceStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          fill={i < level ? '#f59e0b' : 'none'}
          color={i < level ? '#f59e0b' : 'rgba(255,255,255,0.15)'}
        />
      ))}
    </div>
  );
}

interface Props {
  concept: ConceptNode;
}

export function ConceptDetail({ concept }: Props) {
  const { selectConcept } = useConceptStore();
  const { markVisited } = useProgressStore();
  const { openPanel } = useTestStore();
  const { instructorEnabled } = useInstructorStore();

  useEffect(() => {
    markVisited(concept.id);
  }, [concept.id, markVisited]);

  const VizComponent = concept.visualizationType ? VIZ_MAP[concept.visualizationType] : null;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
      className="flex flex-col h-full overflow-hidden relative"
      style={{
        background: 'linear-gradient(180deg, #0c1220 0%, #0d1117 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        width: '440px',
        minWidth: '440px',
        boxShadow: '-12px 0 40px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top shimmer line */}
      <div
        className="h-px flex-shrink-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)',
        }}
      />

      {/* Header */}
      <div
        className="flex items-start justify-between px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex-1 min-w-0">
          <motion.h2
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              fontFamily: 'Space Mono',
              fontSize: '15px',
              marginBottom: '4px',
              background: 'linear-gradient(90deg, #00d4ff, #c792ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {concept.label}
          </motion.h2>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.48)', lineHeight: 1.4 }}>
            {concept.tagline}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Clock size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
                {concept.estimatedReadMinutes}m read
              </span>
            </div>
            <RelevanceStars level={concept.interviewRelevance} />
          </div>
        </div>
        <button
          onClick={() => selectConcept(null)}
          className="p-1.5 rounded-lg transition-all hover:bg-white/5 flex-shrink-0"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-5">
        {/* Instructor panel */}
        <AnimatePresence mode="wait">
          {instructorEnabled && (
            <InstructorPanel key={concept.id} concept={concept} />
          )}
        </AnimatePresence>

        {/* Visualization */}
        {VizComponent && (
          <div>
            <SectionLabel color="#00d4ff" label="Interactive Visualization" />
            <Suspense fallback={<VizPlaceholder />}>
              <VizComponent />
            </Suspense>
          </div>
        )}

        {/* Overview */}
        <div>
          <SectionLabel color="#39ff14" label="Overview" />
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.75 }}>
            {concept.content.overview}
          </p>
        </div>

        {/* Sections */}
        {concept.content.sections.map((section, i) => (
          <div key={i}>
            <h3
              style={{
                fontFamily: 'Space Mono',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.88)',
                marginBottom: '8px',
                letterSpacing: '0.02em',
              }}
            >
              {section.heading}
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.62)', lineHeight: 1.75 }}>
              {section.body}
            </p>
            {section.codeSnippet && <CodeBlock snippet={section.codeSnippet} />}
          </div>
        ))}

        {/* Key Insights */}
        {concept.content.keyInsights.length > 0 && (
          <div
            className="rounded-xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.03) 100%)',
              border: '1px solid rgba(245,158,11,0.18)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star size={12} fill="#f59e0b" color="#f59e0b" />
              <span
                style={{
                  fontFamily: 'Space Mono',
                  fontSize: '10px',
                  color: '#f59e0b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Key Insights
              </span>
            </div>
            <ul className="space-y-2">
              {concept.content.keyInsights.map((insight, i) => (
                <li
                  key={i}
                  className="flex gap-2"
                  style={{ fontSize: '12px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.55 }}
                >
                  <ChevronRight
                    size={12}
                    style={{ color: '#f59e0b', flexShrink: 0, marginTop: '3px' }}
                  />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {concept.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'JetBrains Mono',
                fontSize: '9px',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Practice button */}
        <motion.button
          onClick={() => openPanel(concept.id, concept.label, concept.tagline)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl font-medium relative overflow-hidden group"
          style={{
            fontFamily: 'Space Mono',
            fontSize: '12px',
            background: 'rgba(0,212,255,0.09)',
            border: '1px solid rgba(0,212,255,0.3)',
            color: '#00d4ff',
            boxShadow: '0 0 20px rgba(0,212,255,0.08)',
          }}
        >
          {/* Shimmer sweep */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,212,255,0.1), transparent)',
              transform: 'translateX(-100%)',
              animation: 'none',
            }}
          />
          <BookOpen size={13} className="inline mr-2" />
          Practice This Concept
        </motion.button>
      </div>
    </motion.div>
  );
}

function SectionLabel({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-0.5 h-4 rounded-full" style={{ background: color }} />
      <span
        style={{
          fontFamily: 'Space Mono',
          fontSize: '10px',
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
        }}
      >
        {label}
      </span>
    </div>
  );
}
