import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Play, Users, Trophy, Star, Clock, 
  ChevronRight, Filter, TrendingUp, Sparkles,
  Gamepad2, User
} from 'lucide-react';
import axios from 'axios';
import './CollectionBrowser.css';

import { API_URL, resolveImageUrl } from '../../utils/api';

export default function CollectionBrowser({ onSelectLevel }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'solo_multi'

  const categories = ['All', 'Movies', 'Luxury', 'Travel', 'Architecture', 'Nature', 'Events'];

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      // For now, using the existing getRandomGameData endpoint pattern but fetching all for browser
      const res = await axios.get(`${API_URL}/games/data?gameType=spot_difference&all=true`);
      // Simulating categories if they don't exist in DB
      const data = Array.isArray(res.data) ? res.data : [res.data];
      const enrichedData = data.filter(Boolean).map(item => ({
        ...item,
        category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
        rating: (Math.random() * 2 + 3).toFixed(1),
        plays: Math.floor(Math.random() * 5000) + 100,
        time: '3-5m'
      }));
      setCollections(enrichedData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch levels', err);
      setLoading(false);
    }
  };

  const filtered = collections.filter(c => 
    (activeCategory === 'All' || c.category === activeCategory) &&
    (c.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="collection-browser-container">
      {/* Cinematic Hero Header */}
      <section className="browser-hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-content"
        >
          <div className="badge-glow">SPOT THE DIFFERENCE</div>
          <h1>The Visual <span className="text-gold">Mastery</span> Arena</h1>
          <p>Challenge your perception in stunning 4K event photography. Play solo or compete live.</p>
          
          <div className="hero-stats">
            <div className="h-stat">
              <TrendingUp size={16} />
              <span>1.2M Global Plays</span>
            </div>
            <div className="h-stat">
              <Users size={16} />
              <span>450 Active Matches</span>
            </div>
          </div>
        </motion.div>
        
        <div className="hero-overlay-gradient" />
      </section>

      {/* Control Bar */}
      <div className="browser-controls">
        <div className="category-pills">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-box-luxury">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search collections..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Level Grid */}
      <div className="level-grid-cinematic">
        <AnimatePresence mode='popLayout'>
          {loading ? (
            <div className="browser-loader">
              <Sparkles className="animate-pulse" size={48} />
              <p>Curating Gallery...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-results">
              <p>No collections match your criteria.</p>
            </div>
          ) : (
            filtered.map((level, idx) => (
              <motion.div 
                key={level._id || idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="level-card-premium"
                onClick={() => onSelectLevel(level)}
              >
                <div className="card-media">
                  <img src={resolveImageUrl(level.imageUrl)} alt={level.title} loading="lazy" />
                  <div className="media-overlay">
                    <div className="play-hint">
                      <Play fill="white" size={32} />
                    </div>
                  </div>
                  <div className="difficulty-tag" data-difficulty={level.difficulty}>
                    {level.difficulty}
                  </div>
                </div>

                <div className="card-info">
                  <div className="info-top">
                    <h3>{level.title}</h3>
                    <div className="rating">
                      <Star size={12} fill="#d4af37" color="#d4af37" />
                      <span>{level.rating}</span>
                    </div>
                  </div>
                  
                  <p className="description">{level.description || 'Stunning high-resolution visual challenge.'}</p>
                  
                  <div className="info-footer">
                    <div className="meta">
                      <Clock size={14} />
                      <span>{level.time}</span>
                    </div>
                    <div className="meta">
                      <Users size={14} />
                      <span>{level.plays.toLocaleString()} plays</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Featured Multiplayer Section */}
      <section className="multiplayer-teaser glass-luxury">
        <div className="teaser-content">
          <div className="icon-shield">
            <Gamepad2 size={32} />
          </div>
          <div className="text">
            <h3>Live Competitions</h3>
            <p>Don't just spot alone. Enter the Arena and compete against players in real-time. Highest score wins the Bounty.</p>
          </div>
        </div>
        <button className="arena-btn">
          ENTER ARENA <ChevronRight size={18} />
        </button>
      </section>
    </div>
  );
}
