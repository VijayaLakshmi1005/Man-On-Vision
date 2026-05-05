import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import GameLayout from '../common/GameLayout';
import { useSound } from '../common/useSound';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './SpotDifference.css';

const SpotDifference = () => {
  const { user } = useAuth();
  const [images, setImages] = useState(null);
  const [foundDifferences, setFoundDifferences] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [guestName, setGuestName] = useState(localStorage.getItem('guest_name') || '');
  const [hintsLeft, setHintsLeft] = useState(3);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [wrongClick, setWrongClick] = useState(false);

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    setLoading(true);
    setFoundDifferences([]);
    setWrongClick(false);
    
    try {
      const sessionId = localStorage.getItem('game_session_id') || Math.random().toString(36).substring(7);
      localStorage.setItem('game_session_id', sessionId);

      const response = await axios.get(`${API_URL}/games/data`, {
        params: { gameType: 'spot_difference', sessionId }
      });
      
      if (response.data) {
        setImages(response.data);
        setTimeLeft(response.data.difficulty === 'easy' ? 90 : response.data.difficulty === 'medium' ? 60 : 45);
        setGameOver(false);
        setHintsLeft(3);
      } else {
        // Fallback or No more content
        setGameOver(true);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !loading && images) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && images && !gameOver) {
      handleGameOver();
    }
  }, [timeLeft, gameOver, loading, images]);

  const handleGameOver = async (won = false) => {
    setGameOver(true);
    const finalScore = won ? score + (timeLeft * 10) : score;
    setScore(finalScore);
    if (guestName) localStorage.setItem('guest_name', guestName);

    try {
      const sessionId = localStorage.getItem('game_session_id');
      await axios.post(`${API_URL}/games/score`, {
        sessionId,
        userId: user?._id,
        guestName: user ? user.firstName : guestName,
        gameType: 'spot_difference',
        score: finalScore,
        accuracy: Math.round((foundDifferences.length / images.differences.length) * 100),
        difficulty: images.difficulty,
        contentId: images._id,
        timeTaken: (images.difficulty === 'easy' ? 90 : images.difficulty === 'medium' ? 60 : 45) - timeLeft
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const { playSound } = useSound();

  const handleImageClick = (e) => {
    if (gameOver || loading || !images) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const diffIndex = images.differences.findIndex((diff, index) => {
      if (foundDifferences.includes(index)) return false;
      const distance = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2));
      return distance <= (diff.radius || 5); 
    });

    if (diffIndex !== -1) {
      const newFound = [...foundDifferences, diffIndex];
      setFoundDifferences(newFound);
      setScore(prev => prev + 100);
      playSound('success');

      if (newFound.length === images.differences.length) {
        handleGameOver(true);
      }
    } else {
      setWrongClick(true);
      playSound('error');
      setTimeout(() => setWrongClick(false), 500);
      setTimeLeft(prev => Math.max(0, prev - 5));
    }
  };

  const useHint = () => {
    if (hintsLeft > 0 && !gameOver && images) {
      const remainingIdx = images.differences.findIndex((_, i) => !foundDifferences.includes(i));
      if (remainingIdx !== -1) {
        setFoundDifferences(prev => [...prev, remainingIdx]);
        setHintsLeft(prev => prev - 1);
      }
    }
  };

  if (loading) return (
    <GameLayout title="SPOT DIFFERENCE">
      <div className="game-loading">
        <div className="cinematic-loader"></div>
        <p>Loading cinematic visuals...</p>
      </div>
    </GameLayout>
  );

  if (!images && !loading) return (
    <GameLayout title="SPOT DIFFERENCE">
      <div className="no-content">
        <h2>ALL DIFFERENCES SPOTTED!</h2>
        <p>You've completed all available levels. Check back later for new event shots.</p>
        <button onClick={() => window.location.reload()} className="action-btn">REPLAY ALL</button>
      </div>
    </GameLayout>
  );

  return (
    <GameLayout title="SPOT THE DIFFERENCE">
      <div className={`spot-container ${wrongClick ? 'shake' : ''}`}>
        <div className="spot-header-stats">
          <div className="stat-glass">
            <span className="label">TIME</span>
            <span className={`value ${timeLeft < 10 ? 'pulsing-red' : ''}`}>{timeLeft}s</span>
          </div>
          <div className="stat-glass">
            <span className="label">PROGRESS</span>
            <span className="value">{foundDifferences.length} / {images.differences.length}</span>
          </div>
          <div className="stat-glass">
            <span className="label">SCORE</span>
            <span className="value">{score}</span>
          </div>
          <button className="hint-action" onClick={useHint} disabled={hintsLeft === 0}>
            HINT ({hintsLeft})
          </button>
        </div>

        <div className="spot-gameplay">
          <div className="image-panel glass" onClick={handleImageClick}>
            <img src={images.imageUrl} alt="Original" draggable="false" />
            <div className="panel-tag">ORIGINAL</div>
            {foundDifferences.map(idx => (
              <div 
                key={`orig-${idx}`} 
                className="diff-found-marker" 
                style={{ left: `${images.differences[idx].x}%`, top: `${images.differences[idx].y}%` }}
              >
                <div className="marker-ring"></div>
              </div>
            ))}
          </div>
          <div className="image-panel glass" onClick={handleImageClick}>
            <img src={images.secondImageUrl} alt="Modified" draggable="false" />
            <div className="panel-tag">MODIFIED</div>
            {foundDifferences.map(idx => (
              <div 
                key={`mod-${idx}`} 
                className="diff-found-marker" 
                style={{ left: `${images.differences[idx].x}%`, top: `${images.differences[idx].y}%` }}
              >
                <div className="marker-ring"></div>
              </div>
            ))}
          </div>
        </div>

        {gameOver && (
          <div className="cinematic-overlay">
            <div className="overlay-content glass">
              <h2>{foundDifferences.length === images.differences.length ? 'VISIONARY STATUS!' : 'TIME EXPIRED'}</h2>
              <div className="final-stats">
                <div className="f-stat"><span>Score:</span> <strong>{score}</strong></div>
                <div className="f-stat"><span>Accuracy:</span> <strong>{Math.round((foundDifferences.length / images.differences.length) * 100)}%</strong></div>
              </div>

              {!user && (
                <div className="name-capture-field mt-6 mb-2">
                  <label className="text-[10px] font-bold text-stone-400 block mb-2 tracking-widest">ENTER NAME FOR RANKINGS</label>
                  <input 
                    type="text" 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-luxury-gold transition-all text-center uppercase font-bold tracking-widest"
                  />
                </div>
              )}
              <div className="overlay-actions">
                <button className="btn-primary" onClick={fetchGameData}>NEXT LEVEL</button>
                <button className="btn-secondary" onClick={() => window.location.href='/games'}>EXIT</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default SpotDifference;

