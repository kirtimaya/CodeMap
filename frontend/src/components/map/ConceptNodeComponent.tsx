import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { ConceptNode } from '../../types';
import { useConceptStore } from '../../store/conceptStore';
import { useProgressStore } from '../../store/progressStore';

interface ConceptNodeData {
  concept: ConceptNode;
  parentPos?: { x: number; y: number };
}

const depthStyles: Record<number, string> = {
  1: 'w-20 h-20',
  2: 'w-16 h-16',
  3: 'h-10 px-3',
};

const bloomVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20, delay: i * 0.06 },
  }),
};

function MasteryRing({ mastery }: { mastery: number }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = (mastery / 100) * circ;
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" style={{ pointerEvents: 'none' }}>
      <circle cx="50%" cy="50%" r={r} fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="2" />
      <circle
        cx="50%" cy="50%" r={r}
        fill="none"
        stroke="#00d4ff"
        strokeWidth="2"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export const ConceptNodeComponent = memo(({ data }: NodeProps) => {
  const concept = (data as unknown as ConceptNodeData).concept;
  const { selectedConceptId, toggleExpand, selectConcept, expandedNodeIds, setBreadcrumb } = useConceptStore();
  const { getProgress } = useProgressStore();

  const progress = getProgress(concept.id);
  const isSelected = selectedConceptId === concept.id;
  const isExpanded = expandedNodeIds.has(concept.id);
  const isLeaf = concept.depth >= 2;

  const handleClick = () => {
    if (isLeaf) {
      selectConcept(concept);
    } else {
      toggleExpand(concept.id);
    }
  };

  const getNodeStyle = () => {
    const base = 'relative flex items-center justify-center cursor-pointer select-none transition-all duration-200 will-change-transform ';
    if (concept.depth === 1) {
      return base + 'w-20 h-20 rounded-2xl border font-mono text-xs text-center leading-tight p-1 ';
    }
    if (concept.depth === 2) {
      return base + 'w-16 h-16 rounded-xl border font-mono text-xs text-center leading-tight p-1 ';
    }
    return base + 'h-10 px-3 rounded-full border font-mono text-xs whitespace-nowrap ';
  };

  const getColors = () => {
    if (isSelected) {
      return {
        border: '1px solid #00d4ff',
        background: 'rgba(0,212,255,0.15)',
        boxShadow: '0 0 24px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.15)',
        color: '#00d4ff',
      };
    }
    if (isExpanded) {
      return {
        border: '1px solid rgba(0,212,255,0.5)',
        background: 'rgba(0,212,255,0.08)',
        boxShadow: '0 0 12px rgba(0,212,255,0.2)',
        color: 'rgba(255,255,255,0.9)',
      };
    }
    return {
      border: '1px solid rgba(255,255,255,0.08)',
      background: concept.depth === 1 ? 'rgba(13,17,23,0.9)' : 'rgba(13,17,23,0.7)',
      boxShadow: 'none',
      color: 'rgba(255,255,255,0.75)',
    };
  };

  const colors = getColors();

  return (
    <motion.div
      custom={0}
      variants={bloomVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.08, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={getNodeStyle()}
      style={{ ...colors, willChange: 'transform' }}
      title={concept.tagline}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />

      {/* Mastery ring for visited nodes */}
      {progress.visited && concept.depth >= 2 && concept.depth <= 2 && (
        <MasteryRing mastery={progress.mastery} />
      )}

      {/* High interview relevance star */}
      {concept.interviewRelevance >= 4 && (
        <span className="absolute -top-1 -right-1 z-10">
          <Star size={10} fill="#f59e0b" color="#f59e0b" />
        </span>
      )}

      <span className="relative z-10 leading-tight text-center break-words" style={{ fontFamily: 'Space Mono, monospace', fontSize: concept.depth === 1 ? '10px' : '9px' }}>
        {concept.label}
      </span>

      {/* Expand indicator */}
      {!isLeaf && (
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs"
          style={{ color: isExpanded ? '#00d4ff' : 'rgba(255,255,255,0.3)', fontSize: '8px' }}
        >
          {isExpanded ? '▲' : '▼'}
        </span>
      )}
    </motion.div>
  );
});

ConceptNodeComponent.displayName = 'ConceptNodeComponent';

// Invisible root node — just an anchor
export const RootNodeComponent = memo(({ data }: NodeProps) => {
  const concept = (data as unknown as ConceptNodeData).concept;
  return (
    <div
      className="flex items-center justify-center w-24 h-24 rounded-full"
      style={{
        border: '2px solid rgba(0,212,255,0.3)',
        background: 'rgba(0,212,255,0.05)',
        boxShadow: '0 0 40px rgba(0,212,255,0.1)',
        fontFamily: 'Space Mono, monospace',
        fontSize: '11px',
        color: '#00d4ff',
      }}
    >
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      {concept.label}
    </div>
  );
});

RootNodeComponent.displayName = 'RootNodeComponent';
