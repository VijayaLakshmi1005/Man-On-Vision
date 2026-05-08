import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../utils/api';
import './AdminGameDashboard.css';

const gameModules = [
  { id: 'page-settings', name: 'Zone Appearance', icon: '🎨', color: '#d4af37', label: 'INTERFACE', description: 'Titles, Backgrounds & Game Visibility' },
  { id: 'tictactoe', name: 'Tic Tac Toe', icon: '🎥', color: '#8b0000', label: 'LOGIC', description: 'Manage AI & Player Icons' },
  { id: '2048', name: '2048 Game', icon: '🔢', color: '#ba6a5d', label: 'ALGORITHM', description: 'Manage Tile Labels & Speed' },
  { id: 'spot_difference', name: 'Spot Master', icon: '🔍', color: '#1a1a1a', label: 'PRECISION', description: 'Manage Image Sets & Markers' }
];

const AdminGameDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalImages: 0,
    avgScore: 0,
    engagementRate: 'N/A',
    totalPlays: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/games/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching game stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-game-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <h1>Game Experience Hub</h1>
          <p>Cinematic Content Control System</p>
        </div>
        <div className="header-status">
          <span className="pulse-dot"></span> LIVE SYSTEM
        </div>
      </header>

      <div className="game-module-grid">
        {gameModules.map(module => (
          <div 
            key={module.id} 
            className="module-card" 
            style={{ '--module-color': module.color }}
            onClick={() => navigate(`/admin/games/${module.id}`)}
          >
            <div className="module-icon-container">
              <div className="module-icon">{module.icon}</div>
              <span className="module-label">{module.label}</span>
            </div>
            <div className="module-info">
              <h3>{module.name}</h3>
              <p>{module.description}</p>
            </div>
            <div className="module-footer">
              <span>CONFIGURE</span>
              <i className="arrow-icon">→</i>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-dashboard glass">
        <h3>Engagement Analytics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">TOTAL ASSETS</span>
            <span className="stat-value">{stats.totalImages}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">AVG PERFORMANCE</span>
            <span className="stat-value">{stats.avgScore}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">TOTAL SESSIONS</span>
            <span className="stat-value">{stats.totalPlays}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">ENGAGEMENT</span>
            <span className="stat-value" style={{color: '#d4af37'}}>{stats.engagementRate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};



export default AdminGameDashboard;
