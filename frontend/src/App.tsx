import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/ui/Navbar';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { InterviewHubPage } from './pages/InterviewHubPage';

export default function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080c10', overflow: 'hidden' }}>
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
  );
}
