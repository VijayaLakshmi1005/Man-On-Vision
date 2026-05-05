import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GameLayout from './common/GameLayout';
import { Trophy, Zap, Star, LayoutGrid, Clock, Users } from 'lucide-react';
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
          <p>LOADING CINEMATIC MODULES</p>
        </div>
      </GameLayout>
    );
  }

  const activeGames = zoneData.games.filter(g => g.enabled !== false);

  return (
    <GameLayout title={zoneData.title}>
      <div className="game-hub-container">
        {/* Cinematic Header Stats */}
        <div className="hub-stats-row">
          <div className="hub-stat-card glass-luxury glow-gold">
            <div className="stat-icon-wrapper bg-gold-gradient">
              <Zap className="stat-icon" size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">TOTAL POINTS</span>
              <span className="stat-value">{stats.totalPoints || 0}</span>
            </div>
          </div>
          <div className="hub-stat-card glass-luxury glow-red">
            <div className="stat-icon-wrapper bg-red-gradient">
              <Star className="stat-icon" size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">DAILY STREAK</span>
              <span className="stat-value">{stats.streaks?.spot_difference || 0} DAYS</span>
            </div>
          </div>
          <div className="hub-stat-card glass-luxury">
            <div className="stat-icon-wrapper bg-stone-gradient">
              <Clock className="stat-icon" size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">SESSIONS</span>
              <span className="stat-value">{stats.totalPlays || 0}</span>
            </div>
          </div>
        </div>

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

        {activeTab === 'games' ? (
          <div className="game-grid-premium">
            {activeGames.map((game, idx) => (
              <div 
                key={game.id} 
                className="game-card-premium"
                onClick={() => navigate(`/games/${game.id}`)}
                style={{ '--anim-delay': `${idx * 0.15}s` }}
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
                  <button className="enter-btn">PLAY NOW</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="leaderboard-premium-view animate-slide-up">
            <div className="leaderboard-branding">
              <div className="branding-text">
                <Trophy size={32} className="text-gold mb-2" />
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
                  <div key={index} className={`rank-row rank-${index + 1}`}>
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
                  </div>
                ))
              ) : (
                <div className="no-rankings">
                  <Users size={48} className="opacity-20 mb-4" />
                  <p>NO LEGENDS YET. WILL IT BE YOU?</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="hub-action-footer">
          <div className="footer-line"></div>
          <p className="footer-tagline">Loved the experience? Let's make your event legendary.</p>
          <button className="luxury-cta-btn" onClick={() => navigate('/quote')}>
            <span>GET A QUOTE</span>
            <div className="btn-shimmer"></div>
          </button>
        </div>
      </div>
    </GameLayout>
  );
};

export default GameZone;

