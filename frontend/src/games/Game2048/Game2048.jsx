import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../common/GameLayout';
import GuestNameModal from '../common/GuestNameModal';
import { useSound } from '../common/useSound';
import { useSwipe } from '../common/useSwipe';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Game2048.css';

/**
 * AAA Production-Grade 2048 Event Edition
 */
const Game2048 = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const iconColor = isDarkMode ? "currentColor" : "#000000";
  const [grid, setGrid] = useState(Array(16).fill(0).map(() => ({ value: 0, id: Math.random().toString(36).substr(2, 9), merged: false })));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [guestName, setGuestName] = useState(localStorage.getItem('guest_name') || '');
  const [showNameModal, setShowNameModal] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  
  const moveLock = useRef(false);
  const { playSound } = useSound();

  const [labels, setLabels] = useState({
    2: 'Light', 4: 'Mic', 8: 'Camera', 16: 'Lens', 32: 'Drone',
    64: 'Stage', 128: 'Screen', 256: 'Baraat', 512: 'Decor',
    1024: 'Catering', 2048: 'THE EVENT'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/games/settings?gameType=2048`);
        if (res.data && res.data.settings?.labels) {
          setLabels(res.data.settings.labels);
        }
      } catch (err) {
        console.error('Error fetching 2048 settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const addRandomTile = useCallback((currentGrid, currentDiff = 'medium') => {
    const emptyCells = currentGrid.map((tile, i) => tile.value === 0 ? i : null).filter(v => v !== null);
    if (emptyCells.length === 0) return currentGrid;
    
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = [...currentGrid];
    
    let newValue = 2;
    const rand = Math.random();
    if (currentDiff === 'hard') {
      if (rand < 0.7) newValue = 2;
      else if (rand < 0.9) newValue = 4;
      else newValue = 8;
    } else {
      newValue = rand < 0.9 ? 2 : 4;
    }
    
    newGrid[randomIndex] = { 
      value: newValue, 
      id: Math.random().toString(36).substr(2, 9),
      merged: false,
      isNew: true 
    };
    
    return newGrid;
  }, []);

  const initGame = useCallback(() => {
    let newGrid = Array(16).fill(0).map(() => ({ value: 0, id: Math.random().toString(36).substr(2, 9), merged: false }));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
    moveLock.current = false;
  }, [addRandomTile]);

  useEffect(() => {
    initGame();
    const savedBest = localStorage.getItem('2048_best');
    if (savedBest) setBestScore(parseInt(savedBest));
  }, [initGame]);

  const saveScoreToBackend = async (finalScore) => {
    try {
      const sessionId = localStorage.getItem('game_session_id') || Math.random().toString(36).substring(7);
      localStorage.setItem('game_session_id', sessionId);
      if (guestName) localStorage.setItem('guest_name', guestName);
      
      await axios.post(`${API_URL}/games/score`, {
        sessionId,
        userId: user?._id,
        guestName: user ? user.firstName : guestName,
        gameType: '2048',
        score: finalScore,
        accuracy: won ? 100 : 80,
        difficulty: 'medium'
      });
    } catch (err) {
      console.error('Error saving 2048 score:', err);
    }
  };

  const handleNameComplete = (name) => {
    setGuestName(name);
    setShowNameModal(false);
  };

  useEffect(() => {
    if (!user && !guestName) {
      setShowNameModal(true);
    }
  }, [user, guestName]);

  const move = useCallback((direction) => {
    if (gameOver || moveLock.current) return;
    if (!user && !guestName) {
      setShowNameModal(true);
      return;
    }
    
    moveLock.current = true;
    setIsMoving(true);

    let tempGrid = grid.map(tile => ({ ...tile, merged: false, isNew: false }));
    let moved = false;
    let newScore = score;

    const rotate = (g) => {
      const res = Array(16).fill(null);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          res[c * 4 + (3 - r)] = g[r * 4 + c];
        }
      }
      return res;
    };

    let rotations = 0;
    if (direction === 'up') rotations = 1;
    if (direction === 'right') rotations = 2;
    if (direction === 'down') rotations = 3;

    for (let i = 0; i < rotations; i++) tempGrid = rotate(tempGrid);

    for (let r = 0; r < 4; r++) {
      let row = tempGrid.slice(r * 4, r * 4 + 4);
      let filteredRow = row.filter(tile => tile.value !== 0);
      let newRow = [];

      for (let i = 0; i < filteredRow.length; i++) {
        if (i < filteredRow.length - 1 && filteredRow[i].value === filteredRow[i + 1].value) {
          newRow.push({ 
            value: filteredRow[i].value * 2, 
            id: filteredRow[i].id, 
            merged: true 
          });
          newScore += filteredRow[i].value * 2;
          if (filteredRow[i].value * 2 === 2048) setWon(true);
          i++;
          moved = true;
        } else {
          newRow.push({ ...filteredRow[i], merged: false });
        }
      }

      while (newRow.length < 4) {
        newRow.push({ value: 0, id: Math.random().toString(36).substr(2, 9), merged: false });
      }

      for (let i = 0; i < 4; i++) {
        if (tempGrid[r * 4 + i].value !== newRow[i].value) moved = true;
        tempGrid[r * 4 + i] = newRow[i];
      }
    }

    const backRotations = (4 - rotations) % 4;
    for (let i = 0; i < backRotations; i++) tempGrid = rotate(tempGrid);

    if (moved) {
      playSound('move');
      if (window.navigator.vibrate) window.navigator.vibrate(10);
      
      const finalGrid = addRandomTile(tempGrid);
      setGrid(finalGrid);
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048_best', newScore.toString());
      }

      const canMove = (g) => {
        if (g.some(tile => tile.value === 0)) return true;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const val = g[r * 4 + c].value;
            if (c < 3 && val === g[r * 4 + c + 1].value) return true;
            if (r < 3 && val === g[(r + 1) * 4 + c].value) return true;
          }
        }
        return false;
      };

      if (!canMove(finalGrid)) {
        setGameOver(true);
        saveScoreToBackend(newScore);
      }
    }

    setTimeout(() => {
      moveLock.current = false;
      setIsMoving(false);
    }, 150);
  }, [grid, score, bestScore, gameOver, addRandomTile, playSound, guestName, user, won]);

  useSwipe((dir) => move(dir), {
    threshold: 30,
    velocityThreshold: 0.2,
    enabled: !gameOver && !won
  });

  return (
    <GameLayout title="2048 EVENT EDITION">
      <div className="g2048-container">
        <div className="g2048-header-stats">
          <div className="score-glass">
            <span className="label">SCORE</span>
            <span className="value">{score}</span>
          </div>
          <div className="score-glass">
            <span className="label">BEST</span>
            <span className="value">{bestScore}</span>
          </div>
          <button className="new-event-btn" onClick={initGame}>NEW EVENT</button>
        </div>

        <div className="g2048-board-wrapper">
          <div className="g2048-grid">
            {grid.map((tile, i) => (
              <div key={`cell-${i}`} className="grid-cell">
                <AnimatePresence mode="popLayout">
                  {tile.value > 0 && (
                    <motion.div
                      key={tile.id}
                      initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        filter: isMoving ? 'blur(0.5px)' : 'blur(0px)'
                      }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 500, 
                        damping: 30,
                        mass: 0.8
                      }}
                      className={`tile tile-${tile.value} ${tile.merged ? 'merged' : ''}`}
                    >
                      <span className="tile-num">{tile.value}</span>
                      <span className="tile-txt">{labels[tile.value]}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {(gameOver || won) && (
            <div className="g2048-overlay-cinematic">
              <div className="overlay-content-2048">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <h2 className="font-serif italic text-4xl text-white mb-6">
                    {won ? 'VISIONARY SUCCESS!' : 'EVENT CONCLUDED'}
                  </h2>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-8">
                    Final Score: <strong className="text-white">{score}</strong>
                  </p>
                  <button className="new-event-btn w-full" onClick={initGame}>RESTART EVENT</button>
                </motion.div>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-[10px] text-center text-white/40 uppercase tracking-[0.3em] font-medium opacity-50">
          SWIPE OR DRAG TO ORCHESTRATE
        </p>
        <GuestNameModal isOpen={showNameModal} onComplete={handleNameComplete} />
      </div>
    </GameLayout>
  );
};

export default Game2048;
