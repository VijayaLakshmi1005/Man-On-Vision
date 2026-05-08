import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import GameLayout from '../common/GameLayout';
import GuestNameModal from '../common/GuestNameModal';
import { useSound } from '../common/useSound';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './TicTacToe.css';

const TicTacToe = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const iconColor = isDarkMode ? "currentColor" : "#000000";
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [score, setScore] = useState({ user: 0, ai: 0, draws: 0 });
  const [icons, setIcons] = useState({ user: '🎥', ai: '💡' });
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState(localStorage.getItem('guest_name') || '');
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/games/settings?gameType=tictactoe`);
        if (res.data && res.data.settings) {
          if (res.data.settings.icons) setIcons(res.data.settings.icons);
          if (res.data.settings.defaultDifficulty) setDifficulty(res.data.settings.defaultDifficulty);
        }
      } catch (err) {
        console.error('Error fetching TicTacToe settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const calculateWinner = useCallback((squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    if (squares.every(sq => sq !== null)) return { winner: 'draw', line: [] };
    return null;
  }, []);

  const minimax = useCallback((squares, depth, isMaximizing) => {
    const result = calculateWinner(squares);
    if (result) {
      if (result.winner === 'O') return 10 - depth;
      if (result.winner === 'X') return depth - 10;
      if (result.winner === 'draw') return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          let score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          let score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }, [calculateWinner]);

  const getBestMove = useCallback((squares, diff) => {
    const empty = squares.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (diff === 'easy') {
      return empty[Math.floor(Math.random() * empty.length)];
    }

    if (diff === 'medium') {
      if (Math.random() > 0.5) return getBestMove(squares, 'hard');
      return empty[Math.floor(Math.random() * empty.length)];
    }

    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = 'O';
        let score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }, [minimax]);

  const saveScoreToBackend = async (res) => {
    try {
      const sessionId = localStorage.getItem('game_session_id') || Math.random().toString(36).substring(7);
      localStorage.setItem('game_session_id', sessionId);
      
      if (guestName) localStorage.setItem('guest_name', guestName);
      
      let finalScore = res === 'X' ? 100 : res === 'draw' ? 50 : 0;
      
      await axios.post(`${API_URL}/games/score`, {
        sessionId,
        userId: user?._id,
        guestName: user ? user.firstName : guestName,
        gameType: 'tictactoe',
        score: finalScore,
        accuracy: res === 'X' ? 100 : res === 'draw' ? 50 : 0,
        difficulty
      });
    } catch (err) {
      console.error('Error saving TicTacToe score:', err);
    }
  };

  const handleAIMove = useCallback(() => {
    if (winner || isXNext) return;
    
    setTimeout(() => {
      const move = getBestMove([...board], difficulty);
      if (move !== undefined) {
        const newBoard = [...board];
        newBoard[move] = 'O';
        setBoard(newBoard);
        setIsXNext(true);
        
        const result = calculateWinner(newBoard);
        if (result) {
          setWinner(result.winner);
          setWinningLine(result.line);
          if (result.winner === 'O') setScore(s => ({ ...s, ai: s.ai + 1 }));
          else if (result.winner === 'draw') setScore(s => ({ ...s, draws: s.draws + 1 }));
          saveScoreToBackend(result.winner);
        }
      }
    }, 600);
  }, [board, difficulty, isXNext, winner, getBestMove, calculateWinner]);

  useEffect(() => {
    if (!isXNext && !winner) {
      handleAIMove();
    }
  }, [isXNext, winner, handleAIMove]);

  const { playSound } = useSound();

  const handleClick = (i) => {
    if (board[i] || winner || !isXNext) return;
    if (!user && !guestName) {
      setShowNameModal(true);
      return;
    }
    playSound('click');

    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setIsXNext(false);

    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      if (result.winner === 'X') {
        setScore(s => ({ ...s, user: s.user + 1 }));
        playSound('success');
      } else if (result.winner === 'draw') {
        setScore(s => ({ ...s, draws: s.draws + 1 }));
      }
      saveScoreToBackend(result.winner);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
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

  return (
    <GameLayout title="TIC TAC TOE">
      <div className="ttt-cinematic-container">
        <div className="ttt-header-stats">
          <div className={`player-glass ${isXNext ? 'active glow-red' : ''}`}>
            <span className="label">YOU</span>
            <span className="icon-large">{icons.user}</span>
            <span className="score-val">{score.user}</span>
          </div>
          <div className="draws-glass">
            <span className="label">DRAWS</span>
            <span className="score-val">{score.draws}</span>
          </div>
          <div className={`player-glass ${!isXNext ? 'active glow-gold' : ''}`}>
            <span className="label">AI</span>
            <span className="icon-large">{icons.ai}</span>
            <span className="score-val">{score.ai}</span>
          </div>
        </div>

        <div className="difficulty-pills">
          {['easy', 'medium', 'hard'].map(d => (
            <button 
              key={d} 
              className={`pill ${difficulty === d ? 'selected' : ''}`} 
              onClick={() => setDifficulty(d)}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="ttt-grid-cinematic glass">
          {board.map((sq, i) => (
            <div 
              key={i} 
              className={`ttt-square ${winningLine.includes(i) ? 'winner' : ''} ${sq ? 'occupied' : ''}`}
              onClick={() => handleClick(i)}
            >
              {sq && (
                <span className={`ttt-icon ${sq === 'X' ? 'x-icon' : 'o-icon'}`}>
                  {sq === 'X' ? icons.user : icons.ai}
                </span>
              )}
            </div>
          ))}
        </div>

        {winner && (
          <div className="ttt-overlay-cinematic">
            <div className="overlay-card glass">
              <h2>{winner === 'draw' ? "STALEMATE" : winner === 'X' ? "VICTORY!" : "DEFEAT"}</h2>
              <button className="btn-primary" onClick={resetGame}>REMATCH</button>
            </div>
          </div>
        )}

        <button className="reset-match-btn" onClick={() => setScore({user:0, ai:0, draws:0})}>RESET SERIES</button>
        <GuestNameModal isOpen={showNameModal} onComplete={handleNameComplete} />
      </div>
    </GameLayout>
  );
};

export default TicTacToe;

