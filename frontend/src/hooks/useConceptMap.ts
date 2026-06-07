import { useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { ConceptNode } from '../types';

const RADIAL_PARAMS = {
  depth1Radius: 280,
  depth2Radius: 480,
  depth3Radius: 640,
};

function radialPosition(
  angle: number,
  radius: number,
  cx = 0,
  cy = 0
): { x: number; y: number } {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function buildLayout(
  concepts: ConceptNode[],
  expandedIds: Set<string>
): { nodes: Node[]; edges: Edge[] } {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const childrenOf = new Map<string | null, ConceptNode[]>();
  for (const c of concepts) {
    const key = c.parentId ?? null;
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(c);
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Find root(s) - depth 0 nodes
  const roots = childrenOf.get(null) ?? [];

  for (const root of roots) {
    const depth1Children = childrenOf.get(root.id) ?? [];
    const totalD1 = depth1Children.length;

    for (let i = 0; i < totalD1; i++) {
      const d1 = depth1Children[i];
      const angle = (2 * Math.PI * i) / totalD1 - Math.PI / 2;
      const d1Pos = radialPosition(angle, RADIAL_PARAMS.depth1Radius);

      nodes.push({
        id: d1.id,
        type: 'conceptNode',
        position: d1Pos,
        data: { concept: d1 },
      });

      edges.push({
        id: `${root.id}-${d1.id}`,
        source: root.id,
        target: d1.id,
        type: 'default',
        animated: false,
      });

      if (!expandedIds.has(d1.id)) continue;

      const depth2Children = childrenOf.get(d1.id) ?? [];
      const totalD2 = depth2Children.length;

      for (let j = 0; j < totalD2; j++) {
        const d2 = depth2Children[j];
        // Spread d2 nodes around d1's angle range
        const spread = Math.PI / 2;
        const d2Angle = angle - spread / 2 + (spread * j) / Math.max(1, totalD2 - 1);
        const d2Pos = radialPosition(d2Angle, RADIAL_PARAMS.depth2Radius);

        nodes.push({
          id: d2.id,
          type: 'conceptNode',
          position: d2Pos,
          data: { concept: d2 },
        });

        edges.push({
          id: `${d1.id}-${d2.id}`,
          source: d1.id,
          target: d2.id,
          type: 'default',
        });

        if (!expandedIds.has(d2.id)) continue;

        const depth3Children = childrenOf.get(d2.id) ?? [];
        for (let k = 0; k < depth3Children.length; k++) {
          const d3 = depth3Children[k];
          const d3Spread = Math.PI / 4;
          const d3Angle = d2Angle - d3Spread / 2 + (d3Spread * k) / Math.max(1, depth3Children.length - 1);
          const d3Pos = radialPosition(d3Angle, RADIAL_PARAMS.depth3Radius);

          nodes.push({
            id: d3.id,
            type: 'conceptNode',
            position: d3Pos,
            data: { concept: d3 },
          });

          edges.push({
            id: `${d2.id}-${d3.id}`,
            source: d2.id,
            target: d3.id,
            type: 'default',
          });
        }
      }
    }

    // Add the invisible root node at center
    nodes.push({
      id: root.id,
      type: 'rootNode',
      position: { x: 0, y: 0 },
      data: { concept: root },
    });
  }

  return { nodes, edges };
}

export function useConceptMap(concepts: ConceptNode[], expandedIds: Set<string>) {
  return useMemo(() => buildLayout(concepts, expandedIds), [concepts, expandedIds]);
}

export function buildBreadcrumb(concepts: ConceptNode[], targetId: string): ConceptNode[] {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const trail: ConceptNode[] = [];
  let current = byId.get(targetId);
  while (current) {
    trail.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  // Remove root (depth 0)
  return trail.filter((n) => n.depth > 0);
}
