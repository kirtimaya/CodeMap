import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Brain, Home, GraduationCap, BookOpen } from 'lucide-react';
import { useInstructorStore } from '../../store/instructorStore';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/java', label: 'Java', icon: Map },
  { path: '/springboot', label: 'Spring Boot', icon: Map },
  { path: '/interview', label: 'Interview Hub', icon: Brain },
];

function InstructorToggle() {
  const { instructorEnabled, setInstructorEnabled } = useInstructorStore();

  return (
    <div className="flex items-center gap-2">
      {/* Label */}
      <AnimatePresence>
        {instructorEnabled && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            style={{ fontSize: '9px', color: '#00d4ff', fontFamily: 'Space Mono', whiteSpace: 'nowrap' }}
          >
            INSTRUCTOR ON
          </motion.span>
        )}
      </AnimatePresence>

      {/* Radio pill */}
      <div
        className="relative flex items-center rounded-full p-[3px]"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        {/* Sliding thumb */}
        <motion.div
          className="absolute top-[3px] bottom-[3px] rounded-full"
          animate={{
            left: instructorEnabled ? 'calc(50%)' : '3px',
            width: 'calc(50% - 3px)',
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          style={{
            background: instructorEnabled
              ? 'linear-gradient(90deg, rgba(0,212,255,0.25), rgba(199,146,234,0.22))'
              : 'rgba(255,255,255,0.09)',
            border: `1px solid ${instructorEnabled ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
            boxShadow: instructorEnabled ? '0 0 12px rgba(0,212,255,0.2)' : 'none',
          }}
        />

        <button
          onClick={() => setInstructorEnabled(false)}
          className="relative z-10 flex items-center gap-1 px-3 py-1 rounded-full transition-colors"
          style={{
            color: !instructorEnabled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.35)',
            fontFamily: 'Space Mono',
            fontSize: '10px',
            minWidth: '78px',
            justifyContent: 'center',
          }}
        >
          <BookOpen size={9} />
          Self-Study
        </button>

        <button
          onClick={() => setInstructorEnabled(true)}
          className="relative z-10 flex items-center gap-1 px-3 py-1 rounded-full transition-colors"
          style={{
            color: instructorEnabled ? '#00d4ff' : 'rgba(255,255,255,0.35)',
            fontFamily: 'Space Mono',
            fontSize: '10px',
            minWidth: '78px',
            justifyContent: 'center',
          }}
        >
          <GraduationCap size={9} />
          Instructor
        </button>
      </div>
    </div>
  );
}

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav
      className="flex items-center justify-between px-5 py-2.5 z-30 relative flex-shrink-0"
      style={{
        background: 'rgba(5,8,16,0.88)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5">
        <div className="relative">
          {/* Glow behind logo */}
          <div
            className="absolute inset-0 rounded-lg blur-md opacity-60"
            style={{ background: 'rgba(0,212,255,0.4)' }}
          />
          <div
            className="relative w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.25) 0%, rgba(199,146,234,0.15) 100%)',
              border: '1px solid rgba(0,212,255,0.4)',
            }}
          >
            <span
              style={{ fontFamily: 'Space Mono', fontSize: '10px', color: '#00d4ff', fontWeight: 'bold' }}
            >
              CM
            </span>
          </div>
        </div>
        <span
          style={{
            fontFamily: 'Space Mono',
            fontSize: '13px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(0,212,255,0.7))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          CodeMap
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/' ? pathname === '/' : pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className="relative px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs"
                style={{
                  color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                  background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                  fontFamily: 'Space Mono',
                }}
                whileHover={{
                  color: 'rgba(255,255,255,0.85)',
                  background: 'rgba(255,255,255,0.05)',
                  transition: { duration: 0.15 },
                }}
              >
                <item.icon size={11} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-px rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
                    }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Instructor toggle */}
      <InstructorToggle />
    </nav>
  );
}
