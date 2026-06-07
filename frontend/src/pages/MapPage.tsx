import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConceptMap } from '../components/map/ConceptMap';
import { ConceptDetail } from '../components/detail/ConceptDetail';
import { TestPanel } from '../components/testpanel/TestPanel';
import { useConceptStore } from '../store/conceptStore';
import type { ConceptNode, PageType } from '../types';
import javaData from '../content/java.json';
import springbootData from '../content/springboot.json';

const DATA: Record<PageType, ConceptNode[]> = {
  java: javaData as ConceptNode[],
  springboot: springbootData as ConceptNode[],
};

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

interface Props {
  page: PageType;
}

export function MapPage({ page }: Props) {
  const concepts = DATA[page];
  const { selectedConceptId } = useConceptStore();

  const selectedConcept = selectedConceptId
    ? concepts.find((c) => c.id === selectedConceptId) ?? null
    : null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex h-full"
      style={{ background: '#080c10' }}
    >
      {/* Map area */}
      <div className="flex-1 h-full">
        <ConceptMap concepts={concepts} />
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedConcept && (
          <ConceptDetail key={selectedConcept.id} concept={selectedConcept} />
        )}
      </AnimatePresence>

      {/* Test panel */}
      <TestPanel />
    </motion.div>
  );
}
