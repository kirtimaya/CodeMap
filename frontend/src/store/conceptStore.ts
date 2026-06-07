import { create } from 'zustand';
import type { ConceptNode, PageType } from '../types';

interface ConceptStore {
  currentPage: PageType;
  selectedConceptId: string | null;
  expandedNodeIds: Set<string>;
  breadcrumb: ConceptNode[];
  setPage: (page: PageType) => void;
  selectConcept: (node: ConceptNode | null) => void;
  toggleExpand: (nodeId: string) => void;
  setBreadcrumb: (trail: ConceptNode[]) => void;
  collapseAll: () => void;
}

export const useConceptStore = create<ConceptStore>((set) => ({
  currentPage: 'java',
  selectedConceptId: null,
  expandedNodeIds: new Set(),
  breadcrumb: [],

  setPage: (page) => set({ currentPage: page, selectedConceptId: null, expandedNodeIds: new Set(), breadcrumb: [] }),

  selectConcept: (node) => set({ selectedConceptId: node?.id ?? null }),

  toggleExpand: (nodeId) =>
    set((state) => {
      const next = new Set(state.expandedNodeIds);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return { expandedNodeIds: next };
    }),

  setBreadcrumb: (trail) => set({ breadcrumb: trail }),

  collapseAll: () => set({ expandedNodeIds: new Set(), breadcrumb: [] }),
}));
