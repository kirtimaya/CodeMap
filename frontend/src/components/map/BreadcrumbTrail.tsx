import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { ConceptNode } from '../../types';
import { useConceptStore } from '../../store/conceptStore';

interface Props {
  trail: ConceptNode[];
  onNavigate: (node: ConceptNode) => void;
}

export function BreadcrumbTrail({ trail, onNavigate }: Props) {
  if (trail.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-2 text-xs overflow-x-auto"
      style={{ fontFamily: 'Space Mono, monospace', color: 'rgba(255,255,255,0.5)' }}>
      {trail.map((node, i) => (
        <React.Fragment key={node.id}>
          {i > 0 && <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />}
          <button
            onClick={() => onNavigate(node)}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap"
            style={{ color: i === trail.length - 1 ? '#00d4ff' : undefined }}
          >
            {node.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
