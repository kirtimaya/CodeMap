import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import type { NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ConceptNode } from '../../types';
import { useConceptStore } from '../../store/conceptStore';
import { useConceptMap, buildBreadcrumb } from '../../hooks/useConceptMap';
import { ConceptNodeComponent, RootNodeComponent } from './ConceptNodeComponent';
import { BreadcrumbTrail } from './BreadcrumbTrail';

const nodeTypes: NodeTypes = {
  conceptNode: ConceptNodeComponent,
  rootNode: RootNodeComponent,
};

interface InnerMapProps {
  concepts: ConceptNode[];
}

function InnerMap({ concepts }: InnerMapProps) {
  const { fitView } = useReactFlow();
  const { expandedNodeIds, selectedConceptId, toggleExpand, setBreadcrumb, selectConcept } = useConceptStore();
  const { nodes, edges } = useConceptMap(concepts, expandedNodeIds);

  useEffect(() => {
    const timer = setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 100);
    return () => clearTimeout(timer);
  }, [expandedNodeIds, fitView]);

  useEffect(() => {
    if (selectedConceptId) {
      const trail = buildBreadcrumb(concepts, selectedConceptId);
      setBreadcrumb(trail);
    }
  }, [selectedConceptId, concepts, setBreadcrumb]);

  const trail = useConceptStore((s) => s.breadcrumb);

  const handleBreadcrumbNavigate = useCallback((node: ConceptNode) => {
    selectConcept(node);
    if (node.depth < 2) {
      // Navigating to a cluster node — just expand it
      toggleExpand(node.id);
    }
  }, [selectConcept, toggleExpand]);

  return (
    <div className="flex flex-col h-full">
      <BreadcrumbTrail trail={trail} onNavigate={handleBreadcrumbNavigate} />
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2.5}
          defaultEdgeOptions={{
            style: { stroke: 'rgba(0,212,255,0.2)', strokeWidth: 1.5 },
          }}
          proOptions={{ hideAttribution: true }}
          style={{ background: '#080c10' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="rgba(255,255,255,0.04)"
          />
          <MiniMap
            nodeStrokeWidth={2}
            nodeColor="rgba(0,212,255,0.4)"
            maskColor="rgba(0,0,0,0.7)"
            style={{ background: '#0d1117' }}
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

interface ConceptMapProps {
  concepts: ConceptNode[];
}

export function ConceptMap({ concepts }: ConceptMapProps) {
  return (
    <ReactFlowProvider>
      <InnerMap concepts={concepts} />
    </ReactFlowProvider>
  );
}
