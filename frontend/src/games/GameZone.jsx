import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import GameLayout from './common/GameLayout';
import { Trophy, Zap, Star, LayoutGrid, Clock, Users, Shield, Sparkles, TrendingUp } from 'lucide-react';
import './GameZone.css';

const GameZone = () => {
  const navigate = useNavigate();
  const [zoneData, setZoneData] = useState({ title: 'Game Experience Zone', games: [] });
  const [stats, setStats] = useState({ totalPoints: 0, streaks: {}, totalPlays: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('games');
  const [leaderboardGame, setLeaderboardGame] = useState('spot_difference');

  const API_URL = `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`;

  // Mastery Logic
  const mastery = useMemo(() => {
    const points = stats.totalPoints || 0;
    const level = Math.floor(points / 500) + 1;
    const progress = (points % 500) / 5; // 0-100%
    const titles = ['Novice', 'Apprentice', 'Specialist', 'Expert', 'Visionary', 'Legend'];
    return {
      level,
      progress,
      title: titles[Math.min(level - 1, titles.length - 1)]
    };
  }, [stats.totalPoints]);

  const fetchLeaderboard = async (gameType) => {
    try {
      const res = await axios.get(`${API_URL}/games/leaderboard?gameType=${gameType}`);
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionId = localStorage.getItem('game_session_id');
        const [zoneRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/games/zone`),
          axios.get(`${API_URL}/games/stats`, { params: { sessionId } })
        ]);

        setZoneData(zoneRes.data);
        if (statsRes.data) setStats(statsRes.data);
        fetchLeaderboard(leaderboardGame);
      } catch (error) {
        console.error('Error fetching game zone data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard(leaderboardGame);
    }
  }, [leaderboardGame, activeTab]);

  if (loading) {
    return (
      <GameLayout title="INITIALIZING EXPERIENCE...">
        <div className="experience-loader">
          <div className="loader-ring"></div>
          <p className="animate-pulse tracking-[0.3em]">LOADING CINEMATIC MODULES</p>
        </div>
      </GameLayout>
    );
  }

  const activeGames = zoneData.games.filter(g => g.enabled !== false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <GameLayout title={zoneData.title}>
      <div className="game-hub-container">
        
        {/* AAA Mastery Header */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mastery-banner glass-luxury"
        >
            <div className="mastery-info">
                <div className="level-badge">
                    <Shield className="text-luxury-gold" size={24} />
                    <span className="level-num">{mastery.level}</span>
                </div>
                <div className="mastery-text">
                    <h3>{mastery.title}</h3>
                    <p>MASTERY PROGRESS</p>
                </div>
            </div>
            <div className="mastery-progress-wrapper">
                <div className="progress-track">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${mastery.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="progress-fill"
                    />
                </div>
                <span className="progress-val">{Math.floor(mastery.progress)}%</span>
            </div>
            <Sparkles className="mastery-decor text-luxury-gold/20" size={60} />
        </motion.div>

        {/* Cinematic Stats Row */}
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hub-stats-row"
        >
          <motion.div variants={itemVariants} className="hub-stat-card glass-luxury glow-gold">
            <div className="stat-icon-wrapper bg-gold-gradient">
              <Zap className="stat-icon" size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">TOTAL POINTS</span>
              <span className="stat-value">{stats.totalPoints || 0}</span>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="hub-stat-card glass-luxury glow-red">
            <div className="stat-icon-wrapper bg-red-gradient">
              <Star className="stat-icon" size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">DAILY STREAK</span>
              <span className="stat-value">{Object.values(stats.streaks || {}).reduce((a,b) => Math.max(a,b), 0)} DAYS</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="hub-stat-card glass-luxury">
            <div className="stat-icon-wrapper bg-stone-gradient">
              <Clock className="stat-icon" size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">SESSIONS</span>
              <span className="stat-value">{stats.totalPlays || 0}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hub Navigation */}
        <div className="hub-nav-cinematic">
          <button 
            className={`nav-btn-luxury ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            <div className="btn-glow"></div>
            <LayoutGrid size={16} /> ALL GAMES
          </button>
          <button 
            className={`nav-btn-luxury ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <div className="btn-glow"></div>
            <Trophy size={16} /> HALL OF FAME
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'games' ? (
            <motion.div 
                key="games-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="game-grid-premium"
            >
              {activeGames.map((game, idx) => (
                <motion.div 
                  variants={itemVariants}
                  key={game.id} 
                  className="game-card-premium"
                  onClick={() => navigate(`/games/${game.id}`)}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="card-image-panel">
                    <img src={game.image} alt={game.title} />
                    <div className="image-overlay"></div>
                    <div className="game-icon-badge">{game.icon}</div>
                  </div>
                  <div className="card-details">
                    <div className="title-row">
                      <h3>{game.title}</h3>
                      <span className="diff-badge">{game.difficulty || 'DYNAMIC'}</span>
                    </div>
                    <p>{game.description}</p>
                    <button className="enter-btn">LAUNCH EXPERIENCE</button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
                key="leaderboard-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="leaderboard-premium-view"
            >
              <div className="leaderboard-branding">
                <div className="branding-text text-left">
                  <TrendingUp size={24} className="text-gold mb-2" />
                  <h2>GLOBAL RANKINGS</h2>
                  <p>The elite event masters of Man On Vision</p>
                </div>
                <div className="game-selector-pills">
                  {[
                    { id: 'spot_difference', label: 'SPOT THE DIFFERENCE' },
                    { id: '2048', label: '2048 EVENT EDITION' },
                    { id: 'tictactoe', label: 'TIC TAC TOE' }
                  ].map(game => (
                    <button 
                      key={game.id}
                      className={`selector-pill ${leaderboardGame === game.id ? 'active' : ''}`}
                      onClick={() => setLeaderboardGame(game.id)}
                    >
                      {game.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="leaderboard-list-luxury glass">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={index} 
                        className={`rank-row rank-${index + 1}`}
                    >
                      <div className="rank-pos">
                        {index < 3 ? <Star size={14} className="star-icon" /> : null}
                        #{index + 1}
                      </div>
                      <div className="player-meta">
                        <div className="avatar-shield">
                          {entry.guestName?.charAt(0) || entry.userId?.firstName?.charAt(0) || 'U'}
                        </div>
                        <span className="player-name">{entry.guestName || entry.userId?.firstName || 'Anonymous Member'}</span>
                      </div>
                      <div className="player-score">
                        <span className="pts-val">{entry.score.toLocaleString()}</span>
                        <span className="pts-label">POINTS</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="no-rankings">
                    <Users size={48} className="opacity-20 mb-4" />
                    <p>NO LEGENDS YET. WILL IT BE YOU?</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="hub-action-footer"
        >
          <div className="footer-line"></div>
          <p className="footer-tagline">Loved the experience? Let's make your event legendary.</p>
          <button className="luxury-cta-btn" onClick={() => navigate('/quote')}>
            <span>GET A QUOTE</span>
            <div className="btn-shimmer"></div>
          </button>
        </motion.div>
      </div>
    </GameLayout>
  );
};

export default GameZone;

