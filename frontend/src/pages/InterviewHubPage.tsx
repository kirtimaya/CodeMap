import React from 'react';
import { motion } from 'framer-motion';
import { Star, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ConceptNode, PageType } from '../types';
import { useProgressStore } from '../store/progressStore';
import { useTestStore } from '../store/testStore';
import javaData from '../content/java.json';
import springbootData from '../content/springboot.json';

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

const DATA: Record<PageType, ConceptNode[]> = {
  java: javaData as ConceptNode[],
  springboot: springbootData as ConceptNode[],
};

const PAGE_COLORS: Record<PageType, string> = {
  java: '#00d4ff',
  springboot: '#39ff14',
};

function ConceptCard({ concept }: { concept: ConceptNode }) {
  const { getProgress } = useProgressStore();
  const { openPanel } = useTestStore();
  const navigate = useNavigate();
  const progress = getProgress(concept.id);

  const handleClick = () => {
    openPanel(concept.id, concept.label, concept.tagline);
  };

  const navigateToMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const page = (javaData as ConceptNode[]).find((c) => c.id === concept.id) ? '/java' : '/springboot';
    navigate(page);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      className="rounded-xl p-4 cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${progress.visited ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 style={{ fontFamily: 'Space Mono', fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
          {concept.label}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {Array.from({ length: concept.interviewRelevance }).map((_, i) => (
            <Star key={i} size={8} fill="#f59e0b" color="#f59e0b" />
          ))}
        </div>
      </div>

      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: '12px' }}>
        {concept.tagline}
      </p>

      {/* Mastery bar */}
      {progress.visited && (
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono' }}>Mastery</span>
            <span style={{ fontSize: '9px', color: '#00d4ff', fontFamily: 'JetBrains Mono' }}>{progress.mastery}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: '#00d4ff' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress.mastery}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          {progress.levelsCleared > 0 && (
            <div className="mt-1">
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>
                Highest level cleared: L{progress.levelsCleared}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={handleClick}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs"
          style={{
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: '#00d4ff',
            fontFamily: 'Space Mono',
          }}>
          <BookOpen size={10} />
          Practice
        </button>
        <button onClick={navigateToMap}
          className="px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Space Mono',
          }}>
          Map →
        </button>
      </div>
    </motion.div>
  );
}

function PageSection({ page, title, color }: { page: PageType; title: string; color: string }) {
  const concepts = DATA[page].filter((c) => c.depth >= 2);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-6 rounded-full" style={{ background: color }} />
        <h2 style={{ fontFamily: 'Space Mono', fontSize: '16px', color }}>
          {title}
        </h2>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono' }}>
          {concepts.length} concepts
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {concepts.map((concept, i) => (
          <motion.div
            key={concept.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <ConceptCard concept={concept} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function InterviewHubPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
      style={{ background: '#080c10', padding: '24px 24px 60px' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 style={{ fontFamily: 'Space Mono', fontSize: '28px', color: '#f59e0b', marginBottom: '8px' }}>
            Interview Hub
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Practice questions for every concept. Select any card to start a practice session.
            Stars indicate interview frequency — ★★★★★ means highly likely to appear.
          </p>
        </div>

        <PageSection page="java" title="Java" color={PAGE_COLORS.java} />
        <PageSection page="springboot" title="Spring Boot" color={PAGE_COLORS.springboot} />
      </div>

      {/* Test panel is rendered globally */}
      {/* Import here to make it available */}
      <React.Suspense fallback={null}>
        <TestPanelDynamic />
      </React.Suspense>
    </motion.div>
  );
}

// Lazy wrapper for TestPanel
const TestPanelLazy = React.lazy(() =>
  import('../components/testpanel/TestPanel').then((m) => ({ default: m.TestPanel }))
);
function TestPanelDynamic() {
  return <TestPanelLazy />;
}
