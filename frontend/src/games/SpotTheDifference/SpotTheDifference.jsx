import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ZoomIn, ZoomOut, Maximize, 
  Trophy, Clock, Users, Zap,
  Search, ShieldCheck, Heart, AlertCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './SpotTheDifference.css';

import { API_URL, resolveImageUrl } from '../../utils/api';

export default function SpotTheDifference({ level, onExit }) {
  const [gameState, setGameState] = useState('loading'); // 'loading', 'ready', 'playing', 'finished'
  const [foundIndices, setFoundIndices] = useState([]);
  const [timeLeft, setTimeLeft] = useState(180);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [errors, setErrors] = useState([]); // Visual feedback for wrong clicks

  const containerRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Socket for Multiplayer
  useEffect(() => {
    const s = io(API_URL);
    setSocket(s);

    s.on('stds_room_updated', (data) => {
      setRoomData(data);
      setIsMultiplayer(true);
    });

    s.on('stds_game_started', () => {
      setGameState('playing');
    });

    s.on('stds_broadcast_find', (data) => {
      // Sync found differences from others
      setFoundIndices(prev => {
        if (!prev.includes(data.diffIndex)) {
          return [...prev, data.diffIndex];
        }
        return prev;
      });
    });

    s.on('stds_game_over', (data) => {
      setGameState('finished');
    });

    return () => s.disconnect();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameState('finished');
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, timeLeft]);

  const handleSpot = (e) => {
    if (gameState !== 'playing') return;

    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check against level differences
    const diffIndex = level.differences.findIndex((diff, idx) => {
      if (foundIndices.includes(idx)) return false;
      const distance = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2));
      return distance <= (diff.radius || 3); // Sensitivity
    });

    if (diffIndex !== -1) {
      // Correct Spot
      setFoundIndices(prev => [...prev, diffIndex]);
      setScore(prev => prev + 100);
      
      if (socket && roomData) {
        socket.emit('stds_difference_found', {
          roomId: roomData.id,
          userId: 'me', // Real ID in production
          diffIndex
        });
      }

      // Check win
      if (foundIndices.length + 1 === level.differences.length) {
        handleWin();
      }
    } else {
      // Wrong Spot
      handleError(e.clientX, e.clientY);
    }
  };

  const handleError = (x, y) => {
    setLives(prev => Math.max(0, prev - 1));
    const newError = { id: Date.now(), x, y };
    setErrors(prev => [...prev, newError]);
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== newError.id));
    }, 1000);

    if (lives <= 1) setGameState('finished');
  };

  const handleWin = () => {
    setGameState('finished');
    // Submit score logic...
  };

  const toggleMultiplayer = () => {
    if (socket) {
      const roomId = 'live_' + level._id;
      socket.emit('stds_join_room', {
        roomId,
        userId: 'me',
        name: 'Player',
        levelId: level._id,
        totalDifferences: level.differences.length
      });
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stds-game-wrapper" ref={containerRef}>
      {/* Cinematic HUD Top */}
      <div className="stds-hud-top">
        <div className="hud-left">
          <button className="exit-btn" onClick={onExit}><X size={20} /></button>
          <div className="level-info">
            <span className="l-title">{level.title}</span>
            <span className="l-diff">{level.difficulty}</span>
          </div>
        </div>

        <div className="hud-center">
          <div className={`timer-box ${timeLeft < 30 ? 'critical' : ''}`}>
            <Clock size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="hud-right">
          <div className="score-box">
            <Trophy size={20} className="text-gold" />
            <div className="val">
              <span className="label">SCORE</span>
              <span className="num">{score}</span>
            </div>
          </div>
          <div className="lives-box">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                size={20} 
                fill={i < lives ? "#ef4444" : "transparent"} 
                color={i < lives ? "#ef4444" : "rgba(255,255,255,0.2)"} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="stds-play-container">
        <div className="dual-canvas-wrapper" style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}>
          
          {/* Original Image */}
          <div className="image-pane">
            <img src={resolveImageUrl(level.imageUrl)} alt="Original" draggable="false" />
            <div className="pane-label">ORIGINAL</div>
          </div>

          {/* Target Image (Differences here) */}
          <div className="image-pane clickable" onClick={handleSpot}>
            <img src={resolveImageUrl(level.secondImageUrl || level.imageUrl)} alt="Modified" draggable="false" />
            <div className="pane-label">MODIFIED</div>
            
            {/* Found Differences Markers */}
            {level.differences.map((diff, idx) => (
              foundIndices.includes(idx) && (
                <motion.div 
                  key={idx}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="diff-marker"
                  style={{ left: `${diff.x}%`, top: `${diff.y}%` }}
                >
                  <ShieldCheck size={24} />
                </motion.div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Found Progress Bar */}
      <div className="stds-progress-footer">
        <div className="progress-text">
          FOUND: {foundIndices.length} / {level.differences.length}
        </div>
        <div className="progress-track">
          <motion.div 
            className="progress-fill"
            animate={{ width: `${(foundIndices.length / level.differences.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Visual Error Feedback */}
      <AnimatePresence>
        {errors.map(err => (
          <motion.div 
            key={err.id}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="error-ripple"
            style={{ left: err.x, top: err.y }}
          >
            <AlertCircle color="#ef4444" size={40} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {gameState === 'ready' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stds-overlay">
            <div className="overlay-card glass-luxury">
              <h2>READY FOR THE CHALLENGE?</h2>
              <p>Find {level.differences.length} subtle differences to master this level.</p>
              <div className="btn-group">
                <button className="btn-play" onClick={() => setGameState('playing')}>
                  SOLO START <Zap size={18} />
                </button>
                <button className="btn-multi" onClick={toggleMultiplayer}>
                  COMPETE LIVE <Users size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stds-overlay">
            <div className="overlay-card glass-luxury finished">
              <Trophy size={64} className="text-gold" />
              <h2>{foundIndices.length === level.differences.length ? 'MASTERPIECE!' : 'GAME OVER'}</h2>
              <div className="final-stats">
                <div className="f-stat"><span>SCORE</span><strong>{score}</strong></div>
                <div className="f-stat"><span>ACCURACY</span><strong>{Math.round((foundIndices.length / (foundIndices.length + (3 - lives))) * 100) || 0}%</strong></div>
              </div>
              <button className="btn-play" onClick={onExit}>EXIT TO HUB</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {gameState === 'loading' && (
        <div className="stds-loader">
          <Search size={64} className="animate-spin text-gold" />
          <p>Analyzing Differences...</p>
          <button className="btn-skip" onClick={() => setGameState('ready')}>START GAME</button>
        </div>
      )}
    </div>
  );
}
