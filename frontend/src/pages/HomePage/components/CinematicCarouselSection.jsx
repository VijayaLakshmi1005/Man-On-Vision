import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const projects = [
  { id: 1, title: 'THE FALLEN', sub: 'CONCEPT ART', image: '/assets/gallery/digital_zen.png' },
  { id: 2, title: 'CRIMSON TIDE', sub: 'CINEMATOGRAPHY', image: '/assets/gallery/last_frame.png' },
  { id: 3, title: 'VOID WALKER', sub: '3D RENDER', image: '/assets/gallery/legacy.png' },
  { id: 4, title: 'NEON SHADOWS', sub: 'DIGITAL PAINTING', image: '/assets/gallery/neon_nights.png' },
  { id: 5, title: 'ETHEREAL', sub: 'FANTASY SCENE', image: '/assets/gallery/visionary.png' },
  { id: 6, title: 'OBLIVION', sub: 'ENVIRONMENT', image: '/assets/gallery/digital_zen.png' }, // Reusing images for the mock
  { id: 7, title: 'BLOOD MOON', sub: 'CHARACTER DESIGN', image: '/assets/gallery/last_frame.png' },
  { id: 8, title: 'SOLSTICE', sub: 'ILLUSTRATION', image: '/assets/gallery/legacy.png' },
  { id: 9, title: 'DARK MATTER', sub: 'VFX COMPOSITE', image: '/assets/gallery/neon_nights.png' },
];

const CinematicCarouselSection = () => {
  const [activeIndex, setActiveIndex] = useState(4); // Start at the middle item

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % projects.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);

  // Exact math specifications requested
  const getCardStyles = (offset) => {
    const absOffset = Math.abs(offset);
    const sign = Math.sign(offset); // -1 for left, 1 for right

    if (absOffset === 0) {
      return { scale: 1.0, rotateY: 0, x: 0, z: 120, opacity: 1, zIndex: 50 };
    }
    if (absOffset === 1) {
      return { scale: 0.85, rotateY: sign * -18, x: sign * 170, z: -40, opacity: 1, zIndex: 40 };
    }
    if (absOffset === 2) {
      return { scale: 0.72, rotateY: sign * -30, x: sign * 310, z: -80, opacity: 0.85, zIndex: 30 };
    }
    if (absOffset === 3) {
      return { scale: 0.58, rotateY: sign * -42, x: sign * 430, z: -130, opacity: 0.65, zIndex: 20 };
    }
    if (absOffset === 4) {
      return { scale: 0.48, rotateY: sign * -55, x: sign * 530, z: -180, opacity: 0.35, zIndex: 10 };
    }
    
    // Hide cards beyond offset 4
    return { scale: 0.3, rotateY: sign * -60, x: sign * 600, z: -300, opacity: 0, zIndex: 0 };
  };

  return (
    <div className="relative w-full flex flex-col justify-center items-center scale-[0.60] origin-center z-50 pointer-events-auto mt-[-5vh]">
      
      {/* SVG Filter for procedural grunge */}
      <svg className="hidden">
        <filter id="grunge-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -7" in="noise" result="coloredNoise" />
          <feComposite operator="in" in="SourceGraphic" in2="coloredNoise" result="composite" />
        </filter>
      </svg>

      {/* Carousel Container */}
      <div className="relative w-[75vw] h-[600px] flex items-center justify-center perspective-[1800px] transform-style-preserve-3d mt-[-40px]">
        
        {/* Navigation Buttons */}
        <button 
          onClick={handlePrev} 
          className="absolute left-[-90px] md:left-[-120px] lg:left-[-150px] z-[60] w-[52px] h-[52px] border border-black/30 rounded-full flex items-center justify-center hover:border-black transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        
        <button 
          onClick={handleNext} 
          className="absolute right-[-90px] md:right-[-120px] lg:right-[-150px] z-[60] w-[52px] h-[52px] border border-black/30 rounded-full flex items-center justify-center hover:border-black transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        <AnimatePresence initial={false}>
          {projects.map((proj, index) => {
            // Calculate shortest path offset for infinite loop
            let offset = index - activeIndex;
            if (offset > projects.length / 2) offset -= projects.length;
            if (offset < -projects.length / 2) offset += projects.length;

            const isCenter = offset === 0;
            const styles = getCardStyles(offset);

            // Hide cards completely if they are out of the 9 visible range
            if (Math.abs(offset) > 4) return null;

            return (
              <motion.div
                key={proj.id}
                layout
                initial={false}
                animate={{ 
                  scale: styles.scale, 
                  rotateY: styles.rotateY, 
                  x: styles.x, 
                  z: styles.z,
                  opacity: styles.opacity,
                  zIndex: styles.zIndex
                }}
                transition={{ 
                  duration: 0.7, 
                  ease: [0.22, 1, 0.36, 1] // User requested cubic-bezier
                }}
                className={`absolute w-[340px] h-[400px] rounded-[18px] overflow-hidden cursor-pointer group`}
                style={{
                  boxShadow: isCenter ? '0px 30px 80px rgba(0,0,0,0.45)' : '0px 15px 40px rgba(0,0,0,0.2)',
                  border: isCenter ? '2px solid #ff2b55' : '1px solid rgba(255,255,255,0.1)',
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => setActiveIndex(index)}
              >
                {/* Image */}
                <div className="absolute inset-0 bg-[#0a0a0a]">
                  <img 
                    src={proj.image} 
                    alt={proj.title} 
                    className="w-full h-full object-cover opacity-80 mix-blend-lighten contrast-125 saturate-110 pointer-events-none" 
                  />
                  {/* Rich black gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>
                  
                  {/* Fire/Crimson glow effect */}
                  <div className="absolute bottom-[-20%] left-[-20%] w-[140%] h-[60%] bg-[#ff2b55] opacity-[0.15] blur-[60px] pointer-events-none mix-blend-screen"></div>
                  
                  {/* Glassy reflection */}
                  <div className="absolute top-0 left-0 w-[200%] h-[100%] bg-gradient-to-b from-white/[0.08] to-transparent -rotate-45 translate-x-[-50%] translate-y-[-20%] pointer-events-none"></div>
                </div>

                {/* Text Content */}
                <div className="absolute bottom-[30px] left-[30px] right-[30px] flex flex-col pointer-events-none">
                  <h3 className="font-['Bebas_Neue'] text-white text-[32px] leading-[1] tracking-wide" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
                    {proj.title}
                  </h3>
                  <p className="font-['Inter'] text-[#ff2b55] font-bold text-[10px] uppercase mt-2 tracking-[0.2em]">
                    {proj.sub}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-[60px] flex gap-[12px] z-50">
        {projects.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`rounded-full transition-all duration-500 ${
              idx === activeIndex 
                ? 'w-[6px] h-[6px] bg-[#ff2b55] scale-125 shadow-[0_0_10px_#ff2b55]' 
                : 'w-[6px] h-[6px] bg-[#888888] opacity-50 hover:opacity-100'
            }`}
          />
        ))}
      </div>

    </div>
  );
};

export default CinematicCarouselSection;
