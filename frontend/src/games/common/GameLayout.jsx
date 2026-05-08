import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GameLayout.css';

const GameLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isTouch, setIsTouch] = useState(false);

  const handleExit = () => {
    // If we are on the main Games Hub, go back to the Home Page
    if (location.pathname === '/games') {
      navigate('/');
    } else {
      // If we are inside a specific game, go back to the Games Hub
      navigate('/games');
    }
  };

  useEffect(() => {
    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setCursorPos({ x: clientX, y: clientY });
      if (e.touches) setIsTouch(true);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  return (
    <div className="game-zone-container">
      <div 
        className="global-cursor" 
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />
      
      <button className="back-button" onClick={handleExit}>
        <span className="arrow">←</span>
        <span className="text">EXIT GAME</span>
      </button>


      <div className="particles">

        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>
      
      <div className="game-header">
        <h1 className="glow-text">{title || 'GAME EXPERIENCE ZONE'}</h1>
        <div className="accent-line"></div>
      </div>

      <div className="game-content">
        {children}
      </div>

      <div className="game-footer">
        <p>Loved the game? <a href="/contact" className="cta-link">Plan your event with us!</a></p>
      </div>
    </div>
  );
};

export default GameLayout;
