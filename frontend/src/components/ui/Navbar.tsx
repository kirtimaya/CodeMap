import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Brain, Home } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/java', label: 'Java', icon: Map },
  { path: '/springboot', label: 'Spring Boot', icon: Map },
  { path: '/interview', label: 'Interview Hub', icon: Brain },
];

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav
      className="flex items-center justify-between px-5 py-3 z-30 relative"
      style={{
        background: 'rgba(8,12,16,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)' }}
        >
          <span style={{ fontFamily: 'Space Mono', fontSize: '10px', color: '#00d4ff', fontWeight: 'bold' }}>CM</span>
        </div>
        <span style={{ fontFamily: 'Space Mono', fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>CodeMap</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/' ? pathname === '/' : pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className="relative px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors"
                style={{
                  color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.45)',
                  background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                  fontFamily: 'Space Mono',
                }}
                whileHover={{ color: 'rgba(255,255,255,0.8)' }}
              >
                <item.icon size={12} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-px rounded-full"
                    style={{ background: '#00d4ff' }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
