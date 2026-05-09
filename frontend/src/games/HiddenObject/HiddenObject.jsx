import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Target, Trophy, Clock, 
  Sparkles, MousePointer2, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, Play
} from 'lucide-react';
import axios from 'axios';
import GameLayout from '../common/GameLayout';
import GuestNameModal from '../common/GuestNameModal';
import { useSwipe } from '../common/useSwipe';
import { useSound } from '../common/useSound';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './HiddenObject.css';

const HiddenObject = () => {
  const { user } = useAuth();
  const [levels, setLevels] = useState([]);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState('browser'); // browser, playing, finished
  const [showNameModal, setShowNameModal] = useState(false);
  const [guestName, setGuestName] = useState(localStorage.getItem('guest_name') || '');
  const [foundIndices, setFoundIndices] = useState([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [hints, setHints] = useState(3);
  const [combo, setCombo] = useState(0);

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const { playSound } = useSound();

  const currentLevel = levels[currentLevelIdx];

  const fetchLevels = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/games/data?gameType=hidden_object&all=true`);
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setLevels(data.filter(Boolean));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch levels', err);
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      finishGame();
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
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setGameState('playing');
    setHints(3);
    setCombo(0);
    playSound('start');
  };

  const finishGame = async () => {
    setGameState('finished');
    playSound('victory');
    
    try {
      const sessionId = localStorage.getItem('game_session_id');
      await axios.post(`${API_URL}/games/score`, {
        sessionId,
        userId: user?._id,
        guestName,
        gameType: 'hidden_object',
        score,
        difficulty: currentLevel.difficulty,
        timeTaken: (currentLevel.difficulty === 'hard' ? 90 : 120) - timeLeft,
        contentId: currentLevel._id
      });
    } catch (err) {
      console.error('Score save error', err);
    }
  };

  const handleObjectClick = (e) => {
    if (gameState !== 'playing') return;

    const rect = e.currentTarget.getBoundingClientRect();
    // Adjust for zoom and pan
    const x = (((e.clientX - rect.left) / (rect.width * zoom)) * 100);
    const y = (((e.clientY - rect.top) / (rect.height * zoom)) * 100);

    const objIdx = currentLevel.objects.findIndex((obj, idx) => {
      if (foundIndices.includes(idx)) return false;
      const dist = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
      return dist <= (obj.radius || 5);
    });

    if (objIdx !== -1) {
      const newFound = [...foundIndices, objIdx];
      setFoundIndices(newFound);
      const points = 100 + (combo * 10);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      playSound('success');

      if (newFound.length === currentLevel.objects.length) {
        finishGame();
      }
    } else {
      setCombo(0);
      playSound('error');
    }
  };

  const useHint = () => {
    if (hints <= 0 || gameState !== 'playing') return;
    const remainingIdx = currentLevel.objects.findIndex((_, i) => !foundIndices.includes(i));
    if (remainingIdx !== -1) {
      setHints(prev => prev - 1);
      const obj = currentLevel.objects[remainingIdx];
      // Auto-find or just highlight? User said "Highlight found object" but "Hint system"
      // Let's make it find it but with penalty
      const newFound = [...foundIndices, remainingIdx];
      setFoundIndices(newFound);
      setScore(prev => Math.max(0, prev - 50));
      playSound('hint');
      
      if (newFound.length === currentLevel.objects.length) {
        finishGame();
      }
    }
  };

  const handleZoom = (delta) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 1), 3));
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) setIsPanning(true);
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan(prev => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  if (loading) return (
    <GameLayout title="HIDDEN OBJECT">
      <div className="ho-loader"><Sparkles className="animate-spin text-[#ffb040]" size={48} /></div>
    </GameLayout>
  );

  return (
    <GameLayout title="HIDDEN OBJECT – EVENT EDITION">
      <div className="ho-arena">
        
        <AnimatePresence>
          {gameState === 'playing' && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="ho-hud"
            >
              <div className="hud-stat">
                <span className="label">SCORE</span>
                <span className="value">{score}</span>
              </div>
              
              <div className="hud-stat">
                <Clock className={timeLeft < 20 ? 'text-red-500 animate-pulse' : 'text-white/40'} size={16} />
                <span className="value">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>

              <div className="hud-controls">
                <button className="ho-btn" onClick={useHint} disabled={hints <= 0}>
                  <Search size={18} />
                  <span>{hints}</span>
                </button>
                <div className="zoom-controls">
                  <button onClick={() => handleZoom(0.5)}><ZoomIn size={18} /></button>
                  <button onClick={() => handleZoom(-0.5)}><ZoomOut size={18} /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === 'browser' && levels.length > 0 && (
          <div className="ho-browser">
            <div className="browser-header">
              <h2 className="browser-title-main">Select Scene</h2>
              <p className="browser-subtitle">Cinematic Production Environments</p>
            </div>
            
            <div className="browser-cards">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentLevelIdx}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="ho-scene-card"
                  onClick={startLevel}
                >
                  <div className="card-image">
                    <img 
                      src={currentLevel.imageUrl?.startsWith('http') ? currentLevel.imageUrl : `${API_URL.replace('/api', '')}${currentLevel.imageUrl}`} 
                      alt={currentLevel.title} 
                    />
                    <div className={`difficulty-badge ${currentLevel.difficulty}`}>{currentLevel.difficulty}</div>
                  </div>
                  <div className="card-content">
                    <h3 className="text-3xl font-bold">{currentLevel.title}</h3>
                    <div className="flex items-center gap-4 mt-4">
                       <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{currentLevel.objects.length} OBJECTS TO FIND</span>
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black">
                         <Play size={20} fill="black" />
                       </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="ho-carousel-nav">
               <button onClick={() => handleSwipe('right')} disabled={currentLevelIdx === 0}><ChevronLeft /></button>
               <div className="dots">
                 {levels.map((_, i) => <div key={i} className={`dot ${i === currentLevelIdx ? 'active' : ''}`} />)}
               </div>
               <button onClick={() => handleSwipe('left')} disabled={currentLevelIdx === levels.length - 1}><ChevronRight /></button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="ho-stage">
            <div className="object-list-panel">
               <h4 className="list-title">FIND THESE ITEMS</h4>
               <div className="objects-grid">
                 {currentLevel.objects.map((obj, i) => (
                   <div key={i} className={`object-item ${foundIndices.includes(i) ? 'found' : ''}`}>
                     <Target size={14} className="icon" />
                     <span>{obj.name}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div 
              className="ho-image-viewport"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <motion.div 
                className="ho-image-container"
                animate={{ 
                  scale: zoom,
                  x: pan.x,
                  y: pan.y
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                onClick={handleObjectClick}
              >
                <img 
                  src={currentLevel.imageUrl?.startsWith('http') ? currentLevel.imageUrl : `${API_URL.replace('/api', '')}${currentLevel.imageUrl}`} 
                  alt={currentLevel.title} 
                  draggable="false" 
                />
                
                {currentLevel.objects.map((obj, idx) => (
                  foundIndices.includes(idx) && (
                    <motion.div 
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="ho-marker"
                      style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
                    >
                      <div className="marker-inner" />
                      <span className="marker-label">{obj.name}</span>
                    </motion.div>
                  )
                ))}
              </motion.div>
            </div>

            <div className="ho-progress">
               <div className="bar">
                 <div className="fill" style={{ width: `${(foundIndices.length / currentLevel.objects.length) * 100}%` }} />
               </div>
               <span className="text">{foundIndices.length} / {currentLevel.objects.length} OBJECTS RECOVERED</span>
            </div>
          </div>
        )}

        <AnimatePresence>
          {gameState === 'finished' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ho-overlay"
            >
              <div className="ho-result-card glass-luxury">
                <Trophy size={64} className="text-[#ffab3d] mb-6" />
                <h2 className="text-4xl font-black mb-2">SCENE CLEARED</h2>
                <p className="text-white/40 uppercase tracking-widest text-xs mb-8">All production equipment secured</p>
                
                <div className="stats">
                  <div className="stat">
                    <span>FINAL SCORE</span>
                    <strong>{score}</strong>
                  </div>
                  <div className="stat">
                    <span>TIME LEFT</span>
                    <strong>{timeLeft}s</strong>
                  </div>
                </div>

                <button className="ho-replay-btn" onClick={() => setGameState('browser')}>CONTINUE OPERATION</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <GuestNameModal 
        isOpen={showNameModal} 
        onComplete={(name) => { setGuestName(name); setShowNameModal(false); startLevel(); }} 
      />
    </GameLayout>
  );
};

export default HiddenObject;
