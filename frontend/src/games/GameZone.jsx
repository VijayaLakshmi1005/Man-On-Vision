import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import axios from 'axios';
import {
  Zap, Star, TrendingUp, Grid, Search, Puzzle,
  ChevronRight, ArrowRight, Sun, Moon,
  LayoutGrid, Trophy, Settings, Shield, User,
  Activity, ZapOff, Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LiquidMazeStatic from '../components/common/LiquidMazeStatic';
import './GameZone.css';

const GameZone = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('experiences');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPoints: 0, streaks: 0, totalPlays: 0 });
  const [games, setGames] = useState([]);

  const API_URL = `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionId = localStorage.getItem('game_session_id');
        const [zoneRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/games/zone`),
          axios.get(`${API_URL}/games/stats`, { params: { sessionId } })
        ]);

        setGames(zoneRes.data.games.filter(g => g.enabled !== false));
        if (statsRes.data) {
          setStats({
            totalPoints: statsRes.data.totalPoints || 0,
            streaks: Object.values(statsRes.data.streaks || {}).reduce((a, b) => Math.max(a, b), 0),
            totalPlays: statsRes.data.totalPlays || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const GAME_META = {
    tictactoe: { icon: <Grid size={48} />, color: '#ff4f9a', desc: 'Strategic Neural Alignment' },
    '2048': { icon: <Puzzle size={48} />, color: '#ffab3d', desc: 'Numerical Fusion Protocol' },
    spot_difference: { icon: <Search size={48} />, color: '#40e0d0', desc: 'Visual Acuity Calibration' },
    kannada_rapid_fire: { icon: <Zap size={48} />, color: '#ff4f9a', desc: 'Cultural Intelligence Matrix' },
    hidden_object: { icon: <Activity size={48} />, color: '#ffab3d', desc: 'Spatio-Temporal Discovery' },
    default: { icon: <Sparkles size={48} />, color: '#ff4f9a', desc: 'Interactive Experience' }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505]">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-[10px] font-black uppercase tracking-[1em] text-[#ff4f9a]"
      >
        Synchronizing...
      </motion.div>
    </div>
  );

  return (
    <div className={`game-zone-container ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Global Continuous Background - Matching Homepage Theme */}
      <div className="fixed inset-0 z-[-1] will-change-transform" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
        <LiquidMazeStatic
          color1="#ff5a96"
          color2="#ffb040"
          bgColor={isDarkMode ? "#0c0a09" : "#fff5f2"}
          density={0.2}
          speed={0.005}
        />
      </div>

      <div className="dashboard-container">


        {/* Main Content Hub */}
        <main className="dashboard-main px-4 md:px-8 pt-20 md:pt-12 pb-32 md:pb-12">
          {/* Cinematic Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
          >
            <div>
              <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tight mb-2">Game Hub</h1>
              <p className="text-[9px] md:text-xs font-bold uppercase tracking-[0.4em] text-white/30">Cinematic Experiences</p>
            </div>

            {/* Horizontal Command Bar */}
            <div className="command-bar-container">
              <div className="command-pill">
                <SidebarItem
                  icon={<Sparkles size={20} />}
                  label="Book Quote"
                  onClick={() => navigate('/quote')}
                  active={false}
                  color="#ffab3d"
                />
                <div className="pill-divider" />
                <SidebarItem
                  icon={activeTab === 'leaderboard' ? <LayoutGrid size={20} /> : <Trophy size={20} />}
                  label={activeTab === 'leaderboard' ? "Back to Games" : "Leaderboard"}
                  onClick={() => setActiveTab(activeTab === 'leaderboard' ? 'experiences' : 'leaderboard')}
                  active={activeTab === 'leaderboard'}
                />
                <button className="pill-nexus-btn" onClick={() => navigate('/')} title="Return to Nexus">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </motion.header>


          {/* Experience Cards Grid */}
          <AnimatePresence mode="wait">
            {activeTab === 'experiences' ? (
              <motion.div
                key="exp-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
              >
                {games.map((game, i) => (
                  <ExperienceCard
                    key={game.id}
                    game={game}
                    meta={GAME_META[game.id] || GAME_META.default}
                    index={i}
                    onClick={() => navigate(`/games/${game.id}`)}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LeaderboardView
                  API_URL={API_URL}
                  isDarkMode={isDarkMode}
                  onBack={() => setActiveTab('experiences')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom CTA Banner */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-20 p-8 rounded-[40px] bg-gradient-to-r from-[rgba(255,79,154,0.05)] to-[rgba(255,171,61,0.05)] border border-[var(--card-border)] backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--gradient)] flex items-center justify-center shadow-[0_10px_20px_rgba(255,79,154,0.3)]">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Ready to Establish Production?</h3>
                <p className="text-sm opacity-60">Enjoyed the experience? Secure your spot for a premium project now.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/quote')}
              className="cta-button px-8 py-4 rounded-2xl bg-[var(--gradient)] text-white font-bold text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_rgba(255,79,154,0.2)]"
            >
              Book Production Quote
            </button>
          </motion.footer>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, onClick, active, color }) => {
  return (
    <motion.div
      className={`sidebar-item ${active ? 'active' : ''}`}
      onClick={onClick}
      whileHover="hover"
    >
      <div className="item-icon" style={{ color: color || 'inherit' }}>
        {icon}
      </div>
      <motion.span
        className="item-tooltip"
        variants={{
          hover: { opacity: 1, y: 10, scale: 1 },
          initial: { opacity: 0, y: 0, scale: 0.8 }
        }}
        initial="initial"
      >
        {label}
      </motion.span>
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="active-indicator"
        />
      )}
    </motion.div>
  );
};

const MetricCard = ({ label, value, icon, delay }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#ff4f9a';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * 0.05 + offset) * 10;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      offset += 0.05;
      animationFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="metric-card"
    >
      <div className="metric-icon-wrapper">
        {icon}
      </div>
      <div className="metric-info">
        <h4>{label}</h4>
        <p>{value}</p>
      </div>
      <canvas ref={canvasRef} width="100" height="40" className="waveform-canvas" />
    </motion.div>
  );
};

const TicTacToeIcon = ({ isDarkMode }) => {
  const iconColor = isDarkMode ? "currentColor" : "#000000";
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="35" y1="10" x2="35" y2="90" stroke={iconColor} strokeWidth="8" strokeLinecap="round" />
      <line x1="65" y1="10" x2="65" y2="90" stroke={iconColor} strokeWidth="8" strokeLinecap="round" />
      <line x1="10" y1="35" x2="90" y2="35" stroke={iconColor} strokeWidth="8" strokeLinecap="round" />
      <line x1="10" y1="65" x2="90" y2="65" stroke={iconColor} strokeWidth="8" strokeLinecap="round" />
      <path d="M12 12L28 28M28 12L12 28" stroke={iconColor} strokeWidth="8" strokeLinecap="round" />
      <circle cx="50" cy="20" r="8" stroke={iconColor} strokeWidth="8" />
      <circle cx="80" cy="20" r="8" stroke={iconColor} strokeWidth="8" />
      <path d="M42 42L58 58M58 42L42 58" stroke={iconColor} strokeWidth="8" strokeLinecap="round" />
      <path d="M12 72L28 88M28 72L12 88" stroke={iconColor} strokeWidth="8" strokeLinecap="round" />
      <circle cx="80" cy="80" r="8" stroke={iconColor} strokeWidth="8" />
    </svg>
  );
};

const Game2048Icon = ({ isDarkMode }) => {
  const iconColor = isDarkMode ? "currentColor" : "#000000";
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="42%" textAnchor="middle" fill={iconColor} fontSize="44" fontWeight="900" fontFamily="Inter, sans-serif" style={{ letterSpacing: '-2px' }}>20</text>
      <text x="50%" y="85%" textAnchor="middle" fill={iconColor} fontSize="44" fontWeight="900" fontFamily="Inter, sans-serif" style={{ letterSpacing: '-2px' }}>48</text>
    </svg>
  );
};

const HiddenObjectIcon = ({ isDarkMode }) => {
  const iconColor = isDarkMode ? "currentColor" : "#000000";
  return (
    <motion.svg 
      width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
      initial="initial"
      whileHover="hover"
    >
      <path d="M10 50C10 50 25 20 50 20C75 20 90 50 90 50C90 50 75 80 50 80C25 80 10 50 10 50Z" stroke={iconColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="15" stroke={iconColor} strokeWidth="6" />
      <motion.line 
        x1="20" y1="80" x2="80" y2="20" 
        stroke={iconColor} strokeWidth="8" strokeLinecap="round" 
        variants={{
          initial: { pathLength: 1, opacity: 1 },
          hover: { pathLength: [1, 0, 1], opacity: [1, 0.5, 1], transition: { duration: 1.5, repeat: Infinity } }
        }}
      />
    </motion.svg>
  );
};

const RapidFireIcon = ({ isDarkMode }) => {
  const iconColor = isDarkMode ? "currentColor" : "#000000";
  return (
    <motion.svg 
      width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
      initial="initial"
      whileHover="hover"
    >
      {/* Stopwatch Body */}
      <circle cx="60" cy="55" r="35" stroke={iconColor} strokeWidth="6" />
      <rect x="56" y="10" width="8" height="10" fill={iconColor} />
      
      {/* Speed Lines */}
      <motion.line x1="5" y1="35" x2="25" y2="35" stroke={iconColor} strokeWidth="6" strokeLinecap="round" 
        variants={{ hover: { x: [0, 5, 0], opacity: [1, 0.5, 1], transition: { repeat: Infinity, duration: 0.3 } } }} />
      <motion.line x1="0" y1="50" x2="20" y2="50" stroke={iconColor} strokeWidth="6" strokeLinecap="round" 
        variants={{ hover: { x: [0, 8, 0], opacity: [1, 0.3, 1], transition: { repeat: Infinity, duration: 0.4, delay: 0.1 } } }} />
      <motion.line x1="5" y1="65" x2="25" y2="65" stroke={iconColor} strokeWidth="6" strokeLinecap="round" 
        variants={{ hover: { x: [0, 5, 0], opacity: [1, 0.5, 1], transition: { repeat: Infinity, duration: 0.3, delay: 0.2 } } }} />

      {/* Timer Hand */}
      <motion.line 
        x1="60" y1="55" x2="60" y2="35" 
        stroke={iconColor} strokeWidth="6" strokeLinecap="round"
        variants={{
          initial: { rotate: 0 },
          hover: { rotate: 360, transition: { repeat: Infinity, duration: 2, ease: "linear" } }
        }}
        style={{ originX: "60px", originY: "55px" }}
      />
      <circle cx="60" cy="55" r="3" fill={iconColor} />
    </motion.svg>
  );
};

const ExperienceCard = ({ game, meta, index, onClick, isDarkMode }) => {
  let icon = meta.icon;
  if (game.id === 'tictactoe') icon = <TicTacToeIcon isDarkMode={isDarkMode} />;
  if (game.id === '2048') icon = <Game2048Icon isDarkMode={isDarkMode} />;
  if (game.id === 'hidden_object') icon = <HiddenObjectIcon isDarkMode={isDarkMode} />;
  if (game.id === 'kannada_rapid_fire') icon = <RapidFireIcon isDarkMode={isDarkMode} />;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-[20px] md:rounded-[32px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl p-6 md:p-8 cursor-pointer transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10 shadow-xl flex flex-col items-center text-center"
      onClick={onClick}
    >
      <div className="absolute top-0 inset-x-0 mx-auto w-24 h-24 bg-gradient-to-b from-white/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 flex flex-col items-center h-full w-full">
        <div className="mb-6 md:mb-8 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-all duration-500">
          <div className="scale-75 md:scale-90">{icon}</div>
        </div>

        <div>
          <h3 className="font-serif text-lg md:text-2xl font-bold uppercase tracking-tight mb-2 group-hover:text-[#ff5a96] transition-colors duration-500">{game.title}</h3>
          <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 leading-relaxed mb-6 max-w-[180px] mx-auto">{meta.desc}</p>
        </div>

        <div className="mt-auto">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#ff5a96] group-hover:to-[#ffb040] group-hover:text-white group-hover:border-transparent transition-all duration-500">
            <ArrowRight size={14} className="md:size-16" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardView = ({ API_URL, isDarkMode, onBack }) => {
  const [data, setData] = useState([]);
  const [game, setGame] = useState('spot_difference');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/games/leaderboard?gameType=${game}`);
        setData(res.data);
      } catch (e) { console.error(e); }
    };
    fetch();
  }, [game, API_URL]);

  return (
    <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} backdrop-blur-3xl rounded-[40px] border overflow-hidden p-8 transition-colors`}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isDarkMode ? 'border-white/10 hover:bg-white/10 text-white' : 'border-black/10 hover:bg-black/10 text-black'
              }`}
          >
            <ArrowRight className="rotate-180" size={18} />
          </button>
          <h2 className="text-2xl font-bold italic tracking-tight">Hall of Legends</h2>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {['spot_difference', '2048', 'tictactoe', 'kannada_rapid_fire', 'hidden_object'].map(g => (
            <button
              key={g}
              onClick={() => setGame(g)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${game === g
                  ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/10 text-black')
                  : (isDarkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black')
                }`}
            >
              {g.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {data.map((entry, i) => (
          <div key={i} className={`flex items-center justify-between p-6 rounded-[24px] border transition-all ${isDarkMode
              ? 'bg-white/[0.02] border-white/5 hover:bg-white/5'
              : 'bg-black/[0.02] border-black/5 hover:bg-black/5'
            }`}>
            <div className="flex items-center gap-6">
              <span className={`text-xl font-black ${i === 0 ? 'text-[#ffab3d]' : (isDarkMode ? 'opacity-20' : 'opacity-10')}`}>{i + 1}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff4f9a] to-[#ffab3d] flex items-center justify-center font-bold text-white shadow-lg">
                {entry.guestName?.charAt(0) || 'U'}
              </div>
              <span className="font-bold">{entry.guestName || 'Anonymous Legend'}</span>
            </div>
            <span className="text-xl font-bold text-[#ff4f9a]">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameZone;
