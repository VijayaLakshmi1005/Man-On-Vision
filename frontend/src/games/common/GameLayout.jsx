import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LiquidMazeStatic from '../../components/common/LiquidMazeStatic';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import './GameLayout.css';

const GameLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const handleExit = () => {
    if (location.pathname === '/games') {
      navigate('/');
    } else {
      navigate('/games');
    }
  };

  return (
    <div className={`game-zone-viewport ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Homepage Integrated Background */}
      <div className="fixed inset-0 z-[-1]">
        <LiquidMazeStatic 
            color1="#ff5a96" 
            color2="#ffb040" 
            bgColor={isDarkMode ? "#0c0a09" : "#fff5f2"} 
            density={0.15} 
            speed={0.003} 
        />
      </div>

      {/* Minimalist Navigation */}
      <div className="layout-nav">
        <button className="nav-exit-btn group" onClick={handleExit}>
          <div className="icon-ring">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="nav-label">{location.pathname === '/games' ? 'RETURN HOME' : 'EXIT EXPERIENCE'}</span>
        </button>
      </div>

      <main className="game-main-content">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="content-header"
        >
          <h1 className="cinematic-title">{title || 'GAME EXPERIENCE ZONE'}</h1>
          <div className="title-underline"></div>
        </motion.div>

        <div className="interactive-stage">
          {children}
        </div>
      </main>

      <footer className="experience-footer">
        <div className="footer-glass">
          <p className="footer-msg">Crafting Legendary Digital Experiences</p>
          <button onClick={() => navigate('/quote')} className="footer-cta group">
            ESTABLISH PRODUCTION <ExternalLink size={12} className="ml-2 group-hover:rotate-45 transition-transform" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default GameLayout;
