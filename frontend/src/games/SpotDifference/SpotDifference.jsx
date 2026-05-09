import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, ShieldCheck, Heart, AlertCircle, 
  Trophy, Clock, Zap, ChevronRight, ChevronLeft,
  MousePointer2, Sparkles, ZoomIn, ZoomOut, RotateCcw, Play
} from 'lucide-react';
import axios from 'axios';
import GameLayout from '../common/GameLayout';
import GuestNameModal from '../common/GuestNameModal';
import { useSwipe } from '../common/useSwipe';
import { useSound } from '../common/useSound';
import { API_URL, resolveImageUrl } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useGestureEngine } from '../common/useGestureEngine';
import LoadingScreen from '../../components/common/LoadingScreen';
import './SpotTheDifference.css';

const SpotDifference = () => {
  const { user } = useAuth();
  const [levels, setLevels] = useState([]);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState('browser'); 
  const [showNameModal, setShowNameModal] = useState(false);
  const [guestName, setGuestName] = useState(localStorage.getItem('guest_name') || '');
  const [foundIndices, setFoundIndices] = useState([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [clicks, setClicks] = useState([]); 
  const [hints, setHints] = useState(3);
  
  const imageRef = useRef(null);
  const timerRef = useRef(null);
  const lastClickTime = useRef(0);
  const { playSound } = useSound();

  const currentLevel = levels[currentLevelIdx];

  const { zoom, pan, handlers, setZoom, setPan } = useGestureEngine({
    onTap: (coords) => handleSpot(coords),
    minZoom: 1,
    maxZoom: 4,
    disablePinch: true,
    disableDrag: true // Stationary marking mode for precision
  });

  const fetchLevels = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/games/data?gameType=spot_difference&all=true`);
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setLevels(data.filter(Boolean));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch levels', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, timeLeft]);

  const handleSwipe = useCallback((dir) => {
    if (gameState !== 'browser') return;
    if (dir === 'left' && currentLevelIdx < levels.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      playSound('move');
    } else if (dir === 'right' && currentLevelIdx > 0) {
      setCurrentLevelIdx(prev => prev - 1);
      playSound('move');
    }
  }, [gameState, currentLevelIdx, levels.length, playSound]);

  useSwipe(handleSwipe, { enabled: gameState === 'browser' });

  const startLevel = () => {
    if (!user && !guestName) {
      setShowNameModal(true);
      return;
    }
    setFoundIndices([]);
    setTimeLeft(currentLevel.difficulty === 'hard' ? 90 : 120);
    setScore(0);
    setCombo(0);
    setGameState('playing');
    playSound('start');
  };

  const handleNameComplete = (name) => {
    setGuestName(name);
    setShowNameModal(false);
    startLevel();
  };

  const [aspectRatio, setAspectRatio] = useState(1.6); // Default 16:10

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight);
    }
  };

  const handleSpot = ({ x: clientX, y: clientY }) => {
    if (gameState !== 'playing' || !imageRef.current) return;

    const now = Date.now();
    if (now - lastClickTime.current < 200) return;
    lastClickTime.current = now;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    
    const rx = clientX - rect.left;
    const ry = clientY - rect.top;

    if (rx < 0 || rx > rect.width || ry < 0 || ry > rect.height) return;

    // Use percentages if admin mapped using percentages
    const relativeX = (rx / rect.width) * 100;
    const relativeY = (ry / rect.height) * 100;

    const diffIdx = currentLevel.differences.findIndex((diff, idx) => {
      if (foundIndices.includes(idx)) return false;
      
      const dx = relativeX - diff.x;
      const dy = relativeY - diff.y;
      
      // Radius conversion from px to relative if needed, but here we assume diff.radius is a reasonable hit area
      // If Admin used 40px radius, on a 1000px image that's 4%.
      const threshold = 4; // 4% hit area radius

      return Math.sqrt(dx * dx + dy * dy) <= threshold;
    });

    const clickId = Date.now();
    setClicks(prev => [...prev, { id: clickId, x: relativeX, y: relativeY, success: diffIdx !== -1 }]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== clickId));
    }, 1000);

    if (diffIdx !== -1) {
      const newFound = [...foundIndices, diffIdx];
      setFoundIndices(newFound);
      const comboBonus = combo * 10;
      setScore(prev => prev + 100 + comboBonus);
      setCombo(prev => prev + 1);
      playSound('success');
      
      if (newFound.length === currentLevel.differences.length) {
        setGameState('finished');
        playSound('victory');
      }
    } else {
      setCombo(0);
      playSound('error');
    }
  };

  const useHint = () => {
    if (hints <= 0 || gameState !== 'playing') return;
    const remainingIdx = currentLevel.differences.findIndex((_, i) => !foundIndices.includes(i));
    if (remainingIdx !== -1) {
      setFoundIndices(prev => [...prev, remainingIdx]);
      setHints(prev => prev - 1);
      setScore(prev => Math.max(0, prev - 50));
      playSound('hint');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <GameLayout title="SPOT THE DIFFERENCE">
      <div className="std-arena">
        
        <AnimatePresence>
          {gameState === 'playing' && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="std-hud-minimal"
            >
              <div className="hud-stat">
                <span className="hud-label">SCORE</span>
                <span className="hud-value">{score}</span>
              </div>
              
              <div className="hud-stat">
                <Clock className={timeLeft < 20 ? 'text-red-500 animate-pulse' : 'text-white/40'} size={16} />
                <span className="hud-value">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>

              <div className="hud-stat">
                <button className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full hover:bg-white/10 transition-colors" onClick={useHint} disabled={hints <= 0}>
                   <Search size={14} className="text-[#ffb040]" />
                   <span className="text-xs font-bold">{hints}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === 'browser' && levels.length > 0 && (
          <div className="std-browser">
            <div className="browser-header">
              <div className="browser-badge">LEVEL SELECTOR</div>
              <h2 className="browser-title-main">Choose Your Protocol</h2>
              <p className="browser-subtitle">Slide to explore Visual Intelligence Challenges</p>
            </div>
            
            <div className="browser-main-view">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentLevelIdx}
                  initial={{ x: 300, opacity: 0, scale: 0.9 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: -300, opacity: 0, scale: 0.9 }}
                  className="browser-card-premium group"
                  onClick={startLevel}
                >
                  <div className="card-media-wrapper">
                    <img 
                      src={resolveImageUrl(currentLevel.imageUrl)} 
                      alt={currentLevel.title} 
                    />
                    <div className={`card-difficulty-tag ${currentLevel.difficulty}`}>{currentLevel.difficulty}</div>
                  </div>
                  <div className="card-info-overlay">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black text-[#ffb040] uppercase tracking-[0.3em] mb-2 block">EXPERIENCE {currentLevelIdx + 1}</span>
                        <h3 className="text-3xl font-serif italic text-white">{currentLevel.title}</h3>
                      </div>
                      <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                        <Play size={20} fill="white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="level-selection-rail no-scrollbar">
              {levels.map((level, i) => (
                <div 
                  key={level._id}
                  className={`rail-item ${i === currentLevelIdx ? 'active' : ''}`}
                  onClick={() => setCurrentLevelIdx(i)}
                >
                  <img src={resolveImageUrl(level.imageUrl)} alt={level.title} />
                </div>
              ))}
            </div>

            <div className="carousel-controls-minimal">
              <button onClick={() => handleSwipe('right')} disabled={currentLevelIdx === 0} className="control-btn"><ChevronLeft /></button>
              <div className="pagination-dots">
                {levels.map((_, i) => <div key={i} className={`pag-dot ${i === currentLevelIdx ? 'active' : ''}`} />)}
              </div>
              <button onClick={() => handleSwipe('left')} disabled={currentLevelIdx === levels.length - 1} className="control-btn"><ChevronRight /></button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="std-engine-stage">
            <div 
              className="dual-image-viewport" 
              style={{ 
                touchAction: 'none', 
                overflow: 'hidden', 
                background: '#1a1a1a',
                borderRadius: '40px',
                aspectRatio: `auto`,
                height: 'auto',
                maxHeight: '75vh'
              }}
              {...handlers}
            >
              <div 
                className="dual-image-grid" 
                style={{ 
                  width: '100%', 
                  height: '100%'
                }}
              >
                <motion.div 
                  className="image-canvas-wrapper"
                  animate={{ scale: zoom, x: pan.x, y: pan.y }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.5 }}
                >
                  <img 
                    src={resolveImageUrl(currentLevel.imageUrl)} 
                    onLoad={handleImageLoad}
                    alt="Original" 
                    draggable="false" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <div className="image-role-tag">REFERENCE</div>
                </motion.div>

                <motion.div 
                  className="image-canvas-wrapper interactive"
                  animate={{ scale: zoom, x: pan.x, y: pan.y }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.5 }}
                >
                  <img 
                    ref={imageRef}
                    src={resolveImageUrl(currentLevel.secondImageUrl || currentLevel.imageUrl)} 
                    alt="Modified" 
                    draggable="false" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <div className="image-role-tag">TARGET</div>
                  
                  {currentLevel.differences.map((diff, idx) => (
                    foundIndices.includes(idx) && (
                      <motion.div 
                        key={idx}
                        initial={{ scale: 3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="spot-marker"
                        style={{ 
                          left: `${diff.x}%`, 
                          top: `${diff.y}%`,
                          position: 'absolute',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 50
                        }}
                      >
                        <div className="marker-inner-green" />
                      </motion.div>
                    )
                  ))}

                  <AnimatePresence>
                    {clicks.map(click => (
                      <motion.div
                        key={click.id}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className={`click-ripple ${click.success ? 'success' : 'error'}`}
                        style={{ left: `${click.x}%`, top: `${click.y}%` }}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              <div className="std-zoom-overlay absolute bottom-8 right-8 flex flex-col gap-3">
                <button type="button" className="zoom-btn" onClick={() => setZoom(Math.min(zoom + 0.5, 4))}>
                  <ZoomIn size={18} />
                </button>
                <button type="button" className="zoom-btn" onClick={() => setZoom(Math.max(zoom - 0.5, 1))}>
                  <ZoomOut size={18} />
                </button>
                <button type="button" className="zoom-btn reset" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <div className="std-progress-container">
              <div className="std-progress-bar">
                <div className="progress-fill" style={{ width: `${(foundIndices.length / currentLevel.differences.length) * 100}%` }} />
              </div>
              <p className="progress-text-minimal">ANOMALIES DETECTED: {foundIndices.length} / {currentLevel.differences.length}</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {gameState === 'finished' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="std-browser-overlay"
            >
              <div className="overlay-content-premium glass-luxury">
                <Trophy size={64} className="text-[#ffb040] mb-6 mx-auto" />
                <h2 className="result-title font-serif italic">{foundIndices.length === currentLevel.differences.length ? 'PURITY ACHIEVED' : 'ANALYSIS TERMINATED'}</h2>
                <div className="final-score-row">
                  <div className="score-block">
                    <span>POINTS</span>
                    <strong>{score}</strong>
                  </div>
                  <div className="score-block">
                    <span>ANOMALIES</span>
                    <strong>{foundIndices.length}</strong>
                  </div>
                </div>
                <button className="start-challenge-btn w-full" onClick={() => setGameState('browser')}>CONTINUE RESEARCH</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <GuestNameModal 
        isOpen={showNameModal} 
        onComplete={handleNameComplete} 
      />
    </GameLayout>
  );
};

export default SpotDifference;
