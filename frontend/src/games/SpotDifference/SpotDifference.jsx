import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, ShieldCheck, Heart, AlertCircle, 
  Trophy, Clock, Zap, ChevronRight, ChevronLeft,
  MousePointer2, Sparkles
} from 'lucide-react';
import axios from 'axios';
import GameLayout from '../common/GameLayout';
import GuestNameModal from '../common/GuestNameModal';
import { useSwipe } from '../common/useSwipe';
import { useSound } from '../common/useSound';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './SpotTheDifference.css';

const SpotTheDifference = () => {
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
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [errors, setErrors] = useState([]); 
  const [hints, setHints] = useState(3);
  
  const timerRef = useRef(null);
  const lastClickTime = useRef(0);
  const { playSound } = useSound();

  const currentLevel = levels[currentLevelIdx];

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
    setLives(3);
    setCombo(0);
    setGameState('playing');
    playSound('start');
  };

  const handleNameComplete = (name) => {
    setGuestName(name);
    setShowNameModal(false);
    startLevel();
  };

  const saveScore = async (finalScore) => {
    try {
      const sessionId = localStorage.getItem('game_session_id');
      await axios.post(`${API_URL}/games/score`, {
        sessionId,
        gameType: 'spot_difference',
        score: finalScore,
        difficulty: currentLevel.difficulty,
        timeTaken: (currentLevel.difficulty === 'hard' ? 90 : 120) - timeLeft,
        contentId: currentLevel._id
      });
    } catch (err) {
      console.error('Score save error', err);
    }
  };

  const handleSpot = (e) => {
    if (gameState !== 'playing' || lives <= 0) return;

    const now = Date.now();
    if (now - lastClickTime.current < 200) return;
    lastClickTime.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const diffIdx = currentLevel.differences.findIndex((diff, idx) => {
      if (foundIndices.includes(idx)) return false;
      const dist = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2));
      return dist <= (diff.radius || 4);
    });

    if (diffIdx !== -1) {
      const newFound = [...foundIndices, diffIdx];
      setFoundIndices(newFound);
      const comboBonus = combo * 10;
      const newScore = score + 100 + comboBonus;
      setScore(newScore);
      setCombo(prev => prev + 1);
      playSound('success');
      
      if (newFound.length === currentLevel.differences.length) {
        setGameState('finished');
        playSound('victory');
        saveScore(newScore);
      }
    } else {
      setLives(prev => prev - 1);
      setCombo(0);
      playSound('error');
      
      const newErr = { id: Date.now(), x: e.clientX, y: e.clientY };
      setErrors(prev => [...prev, newErr]);
      setTimeout(() => setErrors(prev => prev.filter(err => err.id !== newErr.id)), 800);

      if (lives <= 1) {
        setGameState('finished');
        saveScore(score);
      }
    }
  };

  const useHint = () => {
    if (hints <= 0 || gameState !== 'playing') return;
    const remainingIdx = currentLevel.differences.findIndex((_, i) => !foundIndices.includes(i));
    if (remainingIdx !== -1) {
      const newFound = [...foundIndices, remainingIdx];
      setFoundIndices(newFound);
      setHints(prev => prev - 1);
      setScore(prev => Math.max(0, prev - 50));
      playSound('hint');
      
      if (newFound.length === currentLevel.differences.length) {
        setGameState('finished');
        playSound('victory');
        saveScore(score);
      }
    }
  };

  if (loading) return (
    <GameLayout title="LOADING GALLERY...">
      <div className="std-loader"><Sparkles className="animate-spin text-[#ffb040]" size={48} /></div>
    </GameLayout>
  );

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
                <div className="flex gap-1 ml-4">
                  {[...Array(3)].map((_, i) => (
                    <Heart key={i} size={14} fill={i < lives ? "#ff5a96" : "transparent"} color={i < lives ? "#ff5a96" : "white"} opacity={i < lives ? 1 : 0.2} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === 'browser' && levels.length > 0 && (
          <div className="std-browser">
            <div className="browser-header">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="browser-badge"
              >
                LEVEL SELECTOR
              </motion.div>
              <h2 className="font-serif text-4xl md:text-6xl text-white mb-4">Choose Your Protocol</h2>
              <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.4em]">Slide to explore Visual Intelligence Challenges</p>
            </div>
            
            <div className="browser-main-view">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentLevelIdx}
                  initial={{ x: 300, opacity: 0, scale: 0.9 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: -300, opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="browser-card-premium group"
                  onClick={startLevel}
                >
                  <div className="card-media-wrapper">
                    <img src={currentLevel.imageUrl} alt={currentLevel.title} />
                    <div className={`card-difficulty-tag ${currentLevel.difficulty}`}>{currentLevel.difficulty}</div>
                  </div>
                  <div className="card-info-overlay">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black text-[#ffb040] uppercase tracking-[0.3em] mb-2 block">EXPERIENCE {currentLevelIdx + 1}</span>
                        <h3 className="text-3xl font-serif italic text-white">{currentLevel.title}</h3>
                      </div>
                      <div className="flex gap-4">
                         <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">TARGETS</span>
                            <span className="text-lg font-serif italic text-white">{currentLevel.differences.length}</span>
                         </div>
                         <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                            <Play size={20} fill="white" />
                         </div>
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
                  onClick={() => { setCurrentLevelIdx(i); playSound('move'); }}
                >
                  <img src={level.imageUrl} alt={level.title} />
                  <div className="rail-item-overlay" />
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
            <div className="dual-image-grid">
              <div className="image-canvas-wrapper">
                <img src={currentLevel.imageUrl} alt="Original" draggable="false" />
                <div className="image-role-tag">ORIGINAL REFERENCE</div>
              </div>
              <div className="image-canvas-wrapper interactive" onClick={handleSpot}>
                <img src={currentLevel.secondImageUrl || currentLevel.imageUrl} alt="Modified" draggable="false" />
                <div className="image-role-tag">MODIFIED TARGET</div>
                
                {currentLevel.differences.map((diff, idx) => (
                  foundIndices.includes(idx) && (
                    <motion.div 
                      key={idx}
                      initial={{ scale: 3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="spot-marker"
                      style={{ left: `${diff.x}%`, top: `${diff.y}%` }}
                    />
                  )
                ))}
              </div>
            </div>

            <div className="std-progress-container">
              <div className="std-progress-bar">
                <div className="progress-fill" style={{ width: `${(foundIndices.length / currentLevel.differences.length) * 100}%` }} />
              </div>
              <p className="progress-text-minimal">CALIBRATION STATUS: {foundIndices.length} / {currentLevel.differences.length} ANOMALIES DETECTED</p>
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
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="overlay-content-premium glass-luxury"
              >
                <Trophy size={64} className="text-[#ffb040] mb-6 mx-auto" />
                <h2 className="text-4xl font-serif italic text-white mb-2">{foundIndices.length === currentLevel.differences.length ? 'PURITY ACHIEVED' : 'ANALYSIS TERMINATED'}</h2>
                <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] mb-8">Mastery Evaluation Complete</p>
                
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {errors.map(err => (
          <motion.div 
            key={err.id}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            className="ripple-error"
            style={{ left: err.x, top: err.y }}
          >
            <X size={40} className="text-red-500" />
          </motion.div>
        ))}

      </div>
      <GuestNameModal 
        isOpen={showNameModal} 
        onComplete={handleNameComplete} 
      />
    </GameLayout>
  );
};

const Play = ({ size, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

export default SpotTheDifference;
