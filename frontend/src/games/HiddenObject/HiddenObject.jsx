import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, Target, Trophy, Clock,
  Sparkles, MousePointer2, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, Play, RotateCcw
} from 'lucide-react';
import axios from 'axios';
import GameLayout from '../common/GameLayout';
import GuestNameModal from '../common/GuestNameModal';
import { useSwipe } from '../common/useSwipe';
import { useSound } from '../common/useSound';
import { useGestureEngine } from '../common/useGestureEngine';
import { API_URL, resolveImageUrl } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../../components/common/LoadingScreen';
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
  const [hints, setHints] = useState(3);
  const [combo, setCombo] = useState(0);
  const [clicks, setClicks] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(1.6);

  const imageRef = useRef(null);
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
    setGameState('playing');
    setHints(3);
    setCombo(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
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

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight);
    }
  };

  const processTap = ({ x: clientX, y: clientY }) => {
    if (gameState !== 'playing' || !imageRef.current) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const rx = clientX - rect.left;
    const ry = clientY - rect.top;

    if (rx < 0 || rx > rect.width || ry < 0 || ry > rect.height) return;

    const naturalWidth = img.naturalWidth || currentLevel.naturalWidth || rect.width;
    const naturalHeight = img.naturalHeight || currentLevel.naturalHeight || rect.height;

    const pixelX = (rx / rect.width) * naturalWidth;
    const pixelY = (ry / rect.height) * naturalHeight;
    const relativeX = (rx / rect.width) * 100;
    const relativeY = (ry / rect.height) * 100;

    const objIdx = currentLevel.objects.findIndex((obj, idx) => {
      if (foundIndices.includes(idx)) return false;

      let dist;
      let threshold;

      // Use natural pixels if mapped that way, else percentage
      if (obj.x > 100 || currentLevel.naturalWidth) {
        dist = Math.sqrt(Math.pow(pixelX - obj.x, 2) + Math.pow(pixelY - obj.y, 2));
        threshold = (obj.radius || 40);
      } else {
        dist = Math.sqrt(Math.pow(relativeX - obj.x, 2) + Math.pow(relativeY - obj.y, 2));
        threshold = obj.radius || 5;
      }

      return dist <= threshold;
    });

    const clickId = Date.now();
    setClicks(prev => [...prev, { id: clickId, x: relativeX, y: relativeY, success: objIdx !== -1 }]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== clickId));
    }, 1000);

    if (objIdx !== -1) {
      const newFound = [...foundIndices, objIdx];
      setFoundIndices(newFound);
      setScore(prev => prev + 100 + (combo * 25));
      setCombo(prev => prev + 1);
      playSound('success');
      if (newFound.length === currentLevel.objects.length) finishGame();
    } else {
      setCombo(0);
      playSound('error');
    }
  };

  const { zoom, pan, handlers, setZoom, setPan } = useGestureEngine({
    onTap: processTap,
    minZoom: 1,
    maxZoom: 4,
    disablePinch: true,
    disableDrag: true // Locked viewport as per user request
  });

  const useHint = () => {
    if (hints <= 0 || gameState !== 'playing') return;
    const remainingIdx = currentLevel.objects.findIndex((_, i) => !foundIndices.includes(i));
    if (remainingIdx !== -1) {
      setHints(prev => prev - 1);
      const newFound = [...foundIndices, remainingIdx];
      setFoundIndices(newFound);
      setScore(prev => Math.max(0, prev - 50));
      playSound('hint');
      if (newFound.length === currentLevel.objects.length) finishGame();
    }
  };

  if (loading) return <LoadingScreen />;

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
                  <Search size={16} className="text-[#ffb040]" />
                  <span>{hints}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === 'browser' && levels.length > 0 && (
          <div className="ho-browser">
             <div className="browser-header">
                <div className="browser-badge">SCENE SELECTOR</div>
                <h2 className="browser-title-main text-white font-serif italic text-5xl mb-4">{currentLevel.title}</h2>
                <p className="browser-subtitle text-white/50 uppercase tracking-widest text-[10px]">Challenge Your Perception</p>
             </div>

             <motion.div 
               key={currentLevelIdx}
               initial={{ x: 100, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="ho-scene-card"
               onClick={startLevel}
             >
                <div className="card-image">
                   <img src={resolveImageUrl(currentLevel.imageUrl)} alt={currentLevel.title} />
                   <div className={`difficulty-badge ${currentLevel.difficulty}`}>{currentLevel.difficulty}</div>
                   <div className="card-content absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black to-transparent">
                      <div className="flex justify-between items-end">
                         <div>
                            <span className="text-[#ff4f9a] text-[10px] font-black uppercase tracking-[0.3em]">Protocol {currentLevelIdx + 1}</span>
                            <h3 className="text-white text-3xl font-serif italic mt-2">{currentLevel.title}</h3>
                         </div>
                         <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Play fill="white" size={24} />
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>

             <div className="ho-carousel-nav mt-10">
                <button onClick={() => handleSwipe('right')} className="p-4 rounded-full border border-white/10 text-white/40 hover:text-white transition-colors"><ChevronLeft /></button>
                <div className="dots">
                   {levels.map((_, i) => (
                      <div key={i} className={`dot ${i === currentLevelIdx ? 'active' : ''}`} />
                   ))}
                </div>
                <button onClick={() => handleSwipe('left')} className="p-4 rounded-full border border-white/10 text-white/40 hover:text-white transition-colors"><ChevronRight /></button>
             </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="ho-stage">
            <div 
              className="ho-image-viewport" 
              style={{ 
                aspectRatio: `${aspectRatio}`,
                height: 'auto',
                maxHeight: '75vh'
              }}
              {...handlers}
            >
              <motion.div 
                className="ho-image-container"
                animate={{ scale: zoom, x: pan.x, y: pan.y }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <img 
                  ref={imageRef}
                  src={resolveImageUrl(currentLevel.imageUrl)} 
                  onLoad={handleImageLoad}
                  alt="Scene" 
                  draggable="false" 
                />

                {currentLevel.objects.map((obj, idx) => (
                  foundIndices.includes(idx) && (
                    <div 
                      key={idx} 
                      className="ho-marker" 
                      style={{ left: `${(obj.x / (currentLevel.naturalWidth || 100)) * 100}%`, top: `${(obj.y / (currentLevel.naturalHeight || 100)) * 100}%` }}
                    >
                      <div className="marker-inner" />
                      <span className="marker-label">{obj.name}</span>
                    </div>
                  )
                ))}

                <AnimatePresence>
                   {clicks.map(click => (
                      <motion.div
                        key={click.id}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        className={`ho-click-ripple ${click.success ? 'success' : 'miss'}`}
                        style={{ left: `${click.x}%`, top: `${click.y}%` }}
                      />
                   ))}
                </AnimatePresence>
              </motion.div>

              <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-[100]">
                 <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all" onClick={() => setZoom(Math.min(zoom + 0.5, 4))}><ZoomIn size={18} /></button>
                 <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all" onClick={() => setZoom(Math.max(zoom - 0.5, 1))}><ZoomOut size={18} /></button>
                 <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><RotateCcw size={18} /></button>
              </div>
            </div>

            <div className="object-list-panel">
               <h4 className="list-title">OBJECTIVES FOUND</h4>
               <div className="objects-grid">
                  {currentLevel.objects.map((obj, i) => (
                     <div key={i} className={`object-item ${foundIndices.includes(i) ? 'found' : ''}`}>
                        <Target size={14} className="icon" />
                        <span>{obj.name}</span>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {gameState === 'finished' && (
            <div className="ho-overlay">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ho-result-card glass-luxury"
              >
                <Trophy size={60} className="text-[#ffab3d] mb-6" />
                <h2 className="result-title text-white italic font-serif">MISSION COMPLETE</h2>
                <p className="result-subtitle">All High-Value Targets Identified</p>
                <div className="stats">
                  <div className="stat">
                    <span>SCORE</span>
                    <strong>{score}</strong>
                  </div>
                  <div className="stat">
                    <span>TIME LEFT</span>
                    <strong>{timeLeft}s</strong>
                  </div>
                </div>
                <button className="ho-replay-btn" onClick={() => setGameState('browser')}>NEW MISSION</button>
              </motion.div>
            </div>
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
