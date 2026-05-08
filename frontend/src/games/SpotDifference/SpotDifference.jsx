import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, ShieldCheck, Heart, AlertCircle, 
  Trophy, Clock, Zap, ChevronRight, ChevronLeft,
  MousePointer2, Sparkles
} from 'lucide-react';
import axios from 'axios';
import GameLayout from '../common/GameLayout';
import { useSwipe } from '../common/useSwipe';
import { useSound } from '../common/useSound';
import { API_URL } from '../../utils/api';
import './SpotTheDifference.css';

const SpotTheDifference = () => {
  const [levels, setLevels] = useState([]);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState('browser'); // 'browser', 'ready', 'playing', 'finished'
  const [foundIndices, setFoundIndices] = useState([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [errors, setErrors] = useState([]); // Visual ripples
  const [hints, setHints] = useState(3);
  
  const timerRef = useRef(null);
  const lastClickTime = useRef(0);
  const { playSound } = useSound();

  const currentLevel = levels[currentLevelIdx];

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const res = await axios.get(`${API_URL}/games/data?gameType=spot_difference&all=true`);
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setLevels(data.filter(Boolean));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch levels', err);
      setLoading(false);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleGameOver();
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, timeLeft]);

  const handleSwipe = (dir) => {
    if (gameState !== 'browser') return;
    if (dir === 'left' && currentLevelIdx < levels.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      playSound('move');
    } else if (dir === 'right' && currentLevelIdx > 0) {
      setCurrentLevelIdx(prev => prev - 1);
      playSound('move');
    }
  };

  useSwipe(handleSwipe, { enabled: gameState === 'browser' });

  const startLevel = () => {
    setFoundIndices([]);
    setTimeLeft(currentLevel.difficulty === 'hard' ? 90 : 120);
    setScore(0);
    setLives(3);
    setCombo(0);
    setGameState('playing');
    playSound('start');
  };

  const handleSpot = (e) => {
    if (gameState !== 'playing' || lives <= 0) return;

    // Throttle clicks to prevent spam
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
      // SUCCESS
      setFoundIndices(prev => [...prev, diffIdx]);
      const comboBonus = combo * 10;
      setScore(prev => prev + 100 + comboBonus);
      setCombo(prev => prev + 1);
      playSound('success');
      if (window.navigator.vibrate) window.navigator.vibrate(20);

      if (foundIndices.length + 1 === currentLevel.differences.length) {
        handleWin();
      }
    } else {
      // FAIL
      setLives(prev => prev - 1);
      setCombo(0);
      playSound('error');
      if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50]);
      
      const newErr = { id: Date.now(), x: e.clientX, y: e.clientY };
      setErrors(prev => [...prev, newErr]);
      setTimeout(() => setErrors(prev => prev.filter(err => err.id !== newErr.id)), 800);

      if (lives <= 1) handleGameOver();
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

  const handleWin = () => {
    setGameState('finished');
    playSound('victory');
    saveScore();
  };

  const handleGameOver = () => {
    setGameState('finished');
    saveScore();
  };

  const saveScore = async () => {
    try {
      const sessionId = localStorage.getItem('game_session_id');
      await axios.post(`${API_URL}/games/score`, {
        sessionId,
        gameType: 'spot_difference',
        score,
        difficulty: currentLevel.difficulty,
        timeTaken: (currentLevel.difficulty === 'hard' ? 90 : 120) - timeLeft,
        contentId: currentLevel._id
      });
    } catch (err) {
      console.error('Score save error', err);
    }
  };

  if (loading) return (
    <GameLayout title="LOADING GALLERY...">
      <div className="std-loader"><Sparkles className="animate-spin text-gold" size={48} /></div>
    </GameLayout>
  );

  return (
    <GameLayout title="SPOT THE DIFFERENCE">
      <div className="std-arena">
        
        {/* Cinematic HUD */}
        <AnimatePresence>
          {gameState === 'playing' && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="std-hud"
            >
              <div className="hud-group">
                <div className="hud-glass"><Trophy size={16} /> <span>{score}</span></div>
                <div className="hud-glass"><Zap size={16} /> <span>x{combo}</span></div>
              </div>
              
              <div className={`hud-timer ${timeLeft < 20 ? 'critical' : ''}`}>
                <Clock size={20} />
                <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>

              <div className="hud-group">
                <button className="hint-btn" onClick={useHint} disabled={hints <= 0}>
                   <Search size={16} /> <span>{hints}</span>
                </button>
                <div className="lives-display">
                  {[...Array(3)].map((_, i) => (
                    <Heart 
                      key={i} 
                      size={18} 
                      fill={i < lives ? "#ef4444" : "transparent"} 
                      color={i < lives ? "#ef4444" : "rgba(255,255,255,0.2)"} 
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Browser */}
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
              <h2 className="font-luxury text-4xl md:text-6xl text-white mb-4">Choose Your Protocol</h2>
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
                  className="browser-card glass-luxury"
                >
                  <div className="card-media">
                    <img src={currentLevel.imageUrl} alt={currentLevel.title} />
                    <div className={`card-badge ${currentLevel.difficulty}`}>{currentLevel.difficulty}</div>
                  </div>
                  <div className="card-content">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3>{currentLevel.title}</h3>
                        <div className="card-stats">
                          <span><ShieldCheck size={14} /> {currentLevel.differences.length} TARGETS</span>
                          <span><Clock size={14} /> {currentLevel.difficulty === 'hard' ? '90S' : '120S'}</span>
                        </div>
                      </div>
                      <button className="std-start-btn" onClick={startLevel}>START</button>
                    </div>
                    <p className="text-stone-400 text-sm leading-relaxed">{currentLevel.description || 'Initialize high-precision visual scanning to identify subtle modifications.'}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Horizontal Selection Rail */}
            <div className="browser-rail-container">
              <div className="rail-track custom-scrollbar">
                {levels.map((level, i) => (
                  <motion.div 
                    key={level._id}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rail-item ${i === currentLevelIdx ? 'active' : ''}`}
                    onClick={() => { setCurrentLevelIdx(i); playSound('move'); }}
                  >
                    <div className="item-thumb">
                      <img src={level.imageUrl} alt={level.title} />
                      <div className="item-overlay" />
                    </div>
                    <div className="item-index">{i + 1}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="carousel-nav-simple">
              <button onClick={() => handleSwipe('right')} disabled={currentLevelIdx === 0} className="nav-btn"><ChevronLeft /></button>
              <div className="dots">
                {levels.map((_, i) => <div key={i} className={`dot ${i === currentLevelIdx ? 'active' : ''}`} />)}
              </div>
              <button onClick={() => handleSwipe('left')} disabled={currentLevelIdx === levels.length - 1} className="nav-btn"><ChevronRight /></button>
            </div>
          </div>
        )}

        {/* Play Engine */}
        {gameState === 'playing' && (
          <div className="std-engine">
            <div className="engine-images">
              <div className="img-pane">
                <img src={currentLevel.imageUrl} alt="Original" draggable="false" />
                <div className="pane-tag">ORIGINAL</div>
              </div>
              <div className="img-pane clickable" onClick={handleSpot}>
                <img src={currentLevel.secondImageUrl || currentLevel.imageUrl} alt="Modified" draggable="false" />
                <div className="pane-tag">MODIFIED</div>
                
                {/* Found Markers */}
                {currentLevel.differences.map((diff, idx) => (
                  foundIndices.includes(idx) && (
                    <motion.div 
                      key={idx}
                      initial={{ scale: 3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="found-circle"
                      style={{ left: `${diff.x}%`, top: `${diff.y}%` }}
                    >
                      <div className="pulse" />
                    </motion.div>
                  )
                ))}
              </div>
            </div>

            <div className="std-progress-bar">
              <div className="progress-fill" style={{ width: `${(foundIndices.length / currentLevel.differences.length) * 100}%` }} />
              <span className="progress-text">FOUND: {foundIndices.length} / {currentLevel.differences.length}</span>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameState === 'finished' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="std-overlay"
            >
              <div className="overlay-card glass-luxury">
                <Trophy size={64} className="text-gold mb-4" />
                <h2>{foundIndices.length === currentLevel.differences.length ? 'VISUAL MASTER' : 'CHALLENGE ENDED'}</h2>
                <div className="final-stats">
                  <div className="f-stat"><span>SCORE</span><strong>{score}</strong></div>
                  <div className="f-stat"><span>STREAK</span><strong>{combo}</strong></div>
                </div>
                <button className="std-start-btn w-full" onClick={() => setGameState('browser')}>BACK TO HUB</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple Errors */}
        {errors.map(err => (
          <motion.div 
            key={err.id}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            className="error-ripple"
            style={{ left: err.x, top: err.y }}
          >
            <X size={30} color="#ef4444" />
          </motion.div>
        ))}

      </div>
    </GameLayout>
  );
};

export default SpotTheDifference;
