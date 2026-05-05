import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import GameLayout from '../common/GameLayout';
import { useSound } from '../common/useSound';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Game2048.css';

const Game2048 = () => {
  const { user } = useAuth();
  const [grid, setGrid] = useState(Array(16).fill(0));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [guestName, setGuestName] = useState(localStorage.getItem('guest_name') || '');
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
    const emptyCells = currentGrid.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
    if (emptyCells.length === 0) return currentGrid;
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = [...currentGrid];
    
    // Difficulty logic: Hard spawns higher numbers to fill board faster/make it harder to organize
    const rand = Math.random();
    if (currentDiff === 'hard') {
      if (rand < 0.7) newGrid[randomIndex] = 2;
      else if (rand < 0.9) newGrid[randomIndex] = 4;
      else newGrid[randomIndex] = 8;
    } else if (currentDiff === 'easy') {
      newGrid[randomIndex] = 2; // Always 2 for easy
    } else {
      newGrid[randomIndex] = rand < 0.9 ? 2 : 4;
    }
    
    return newGrid;
  }, []);

  const initGame = useCallback(() => {
    let newGrid = Array(16).fill(0);
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
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

  const { playSound } = useSound();

  const move = useCallback((direction) => {
    if (gameOver) return;

    let newGrid = [...grid];
    let moved = false;
    let newScore = score;
    let merged = false;

    const rotate = (g) => {
      const res = Array(16).fill(0);
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

    for (let i = 0; i < rotations; i++) newGrid = rotate(newGrid);

    for (let r = 0; r < 4; r++) {
      let row = newGrid.slice(r * 4, r * 4 + 4).filter(v => v !== 0);
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
          row[i] *= 2;
          newScore += row[i];
          row.splice(i + 1, 1);
          moved = true;
          merged = true;
          if (row[i] === 2048) {
            setWon(true);
            playSound('success');
          }
        }
      }
      while (row.length < 4) row.push(0);
      
      const startIdx = r * 4;
      for (let i = 0; i < 4; i++) {
        if (newGrid[startIdx + i] !== row[i]) moved = true;
        newGrid[startIdx + i] = row[i];
      }
    }

    const backRotations = (4 - rotations) % 4;
    for (let i = 0; i < backRotations; i++) newGrid = rotate(newGrid);

    if (moved) {
      playSound('move');
      const finalGrid = addRandomTile(newGrid);
      setGrid(finalGrid);
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048_best', newScore.toString());
      }
// ... rest of logic

      const canMove = (g) => {
        if (g.includes(0)) return true;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const val = g[r * 4 + c];
            if (c < 3 && val === g[r * 4 + c + 1]) return true;
            if (r < 3 && val === g[(r + 1) * 4 + c]) return true;
          }
        }
        return false;
      };

      if (!canMove(finalGrid)) {
        setGameOver(true);
        saveScoreToBackend(newScore);
      }
      if (won) saveScoreToBackend(newScore);
    }
  }, [grid, score, bestScore, gameOver, won, addRandomTile]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const dir = e.key.replace('Arrow', '').toLowerCase();
        move(dir);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

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

        <div className="g2048-board-wrapper glass">
          <div className="g2048-grid">
            {grid.map((val, i) => (
              <div key={i} className={`tile tile-${val} ${val > 0 ? 'pop' : 'empty'}`}>
                {val > 0 && (
                  <div className="tile-content">
                    <span className="tile-num">{val}</span>
                    <span className="tile-txt">{labels[val]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {(gameOver || won) && (
            <div className="g2048-overlay-cinematic">
              <div className="overlay-content-2048 glass">
                <h2>{won ? 'VISIONARY SUCCESS!' : 'EVENT CONCLUDED'}</h2>
                <p>Final Score: <strong>{score}</strong></p>

                {!user && (
                  <div className="name-capture-field my-4">
                    <label className="text-[10px] font-bold text-stone-400 block mb-2 tracking-widest">RANKING IDENTITY</label>
                    <input 
                      type="text" 
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="ENTER NAME"
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-luxury-gold transition-all text-center uppercase font-bold tracking-widest"
                    />
                  </div>
                )}
                <button className="btn-primary" onClick={initGame}>RESTART EVENT</button>
              </div>
            </div>
          )}
        </div>

        <div className="g2048-mobile-controls">
          <div className="d-pad-cinematic">
            <button className="ctrl-btn up" onClick={() => move('up')}>▲</button>
            <div className="ctrl-row">
              <button className="ctrl-btn left" onClick={() => move('left')}>◀</button>
              <button className="ctrl-btn down" onClick={() => move('down')}>▼</button>
              <button className="ctrl-btn right" onClick={() => move('right')}>▶</button>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default Game2048;

