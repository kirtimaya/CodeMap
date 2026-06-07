import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/ui/Navbar';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { InterviewHubPage } from './pages/InterviewHubPage';

// Slowly drifting gradient blobs for the ambient background
function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,212,255,0.09) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '-1px -1px',
        }}
      />
      {/* Gradient mesh blobs */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(ellipse at 15% 25%, rgba(0,212,255,0.07) 0%, transparent 48%), radial-gradient(ellipse at 85% 75%, rgba(199,146,234,0.06) 0%, transparent 48%), radial-gradient(ellipse at 50% 90%, rgba(57,255,20,0.04) 0%, transparent 38%)',
            'radial-gradient(ellipse at 18% 28%, rgba(0,212,255,0.07) 0%, transparent 48%), radial-gradient(ellipse at 82% 72%, rgba(199,146,234,0.06) 0%, transparent 48%), radial-gradient(ellipse at 52% 88%, rgba(57,255,20,0.04) 0%, transparent 38%)',
            'radial-gradient(ellipse at 15% 25%, rgba(0,212,255,0.07) 0%, transparent 48%), radial-gradient(ellipse at 85% 75%, rgba(199,146,234,0.06) 0%, transparent 48%), radial-gradient(ellipse at 50% 90%, rgba(57,255,20,0.04) 0%, transparent 38%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div
      className="flex flex-col h-screen relative"
      style={{ background: '#050810', overflow: 'hidden' }}
    >
      <AmbientBackground />

      {/* Content layers above background */}
      <div className="relative flex flex-col h-full" style={{ zIndex: 1 }}>
        <Navbar />
        <div className="flex-1 overflow-auto relative">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/java" element={<MapPage page="java" />} />
              <Route path="/springboot" element={<MapPage page="springboot" />} />
              <Route path="/interview" element={<InterviewHubPage />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
