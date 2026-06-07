import React, { lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Star, BookOpen, ChevronRight } from 'lucide-react';
import type { ConceptNode } from '../../types';
import { useConceptStore } from '../../store/conceptStore';
import { useProgressStore } from '../../store/progressStore';
import { useTestStore } from '../../store/testStore';
import { CodeBlock } from '../ui/CodeBlock';

// Lazy-load visualizations
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
    <div className="flex items-center justify-center h-48 rounded-xl"
      style={{ border: '1px dashed rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.03)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'Space Mono' }}>
          Loading visualization...
        </span>
      </div>
    </div>
  );
}

interface Props {
  concept: ConceptNode;
}

function RelevanceStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < level ? '#f59e0b' : 'none'}
          color={i < level ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
        />
      ))}
    </div>
  );
}

export function ConceptDetail({ concept }: Props) {
  const { selectConcept } = useConceptStore();
  const { markVisited } = useProgressStore();
  const { openPanel } = useTestStore();

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
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: '#0d1117',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        width: '420px',
        minWidth: '420px',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex-1 min-w-0">
          <h2 style={{ fontFamily: 'Space Mono', fontSize: '16px', color: '#00d4ff', marginBottom: '4px' }}>
            {concept.label}
          </h2>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
            {concept.tagline}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Clock size={11} style={{ color: 'rgba(255,255,255,0.35)' }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono' }}>
                {concept.estimatedReadMinutes}m
              </span>
            </div>
            <RelevanceStars level={concept.interviewRelevance} />
          </div>
        </div>
        <button
          onClick={() => selectConcept(null)}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Visualization */}
        {VizComponent && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full" style={{ background: '#00d4ff' }} />
              <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Interactive Visualization
              </span>
            </div>
            <Suspense fallback={<VizPlaceholder />}>
              <VizComponent />
            </Suspense>
          </div>
        )}

        {/* Overview */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full" style={{ background: '#39ff14' }} />
            <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#39ff14', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Overview
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            {concept.content.overview}
          </p>
        </div>

        {/* Sections */}
        {concept.content.sections.map((section, i) => (
          <div key={i}>
            <h3 style={{ fontFamily: 'Space Mono', fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
              {section.heading}
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: section.codeSnippet ? '0' : '0' }}>
              {section.body}
            </p>
            {section.codeSnippet && <CodeBlock snippet={section.codeSnippet} />}
          </div>
        ))}

        {/* Key Insights */}
        {concept.content.keyInsights.length > 0 && (
          <div className="rounded-xl p-4"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Key Insights
              </span>
            </div>
            <ul className="space-y-2">
              {concept.content.keyInsights.map((insight, i) => (
                <li key={i} className="flex gap-2" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  <ChevronRight size={12} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '3px' }} />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {concept.tags.map((tag) => (
            <span key={tag}
              className="px-2 py-0.5 rounded-md text-xs"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'JetBrains Mono',
                fontSize: '10px',
              }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Practice button */}
        <button
          onClick={() => openPanel(concept.id, concept.label, concept.tagline)}
          className="w-full py-3 rounded-xl font-medium transition-all duration-200"
          style={{
            fontFamily: 'Space Mono',
            fontSize: '12px',
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.3)',
            color: '#00d4ff',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.18)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,212,255,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          <BookOpen size={14} className="inline mr-2" />
          Practice This Concept
        </button>
      </div>
    </motion.div>
  );
}
