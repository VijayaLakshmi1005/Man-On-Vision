import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CircularGallery from '../../../components/common/CircularGallery/CircularGallery';

const SectionShowcase = () => {
    const { isDarkMode } = useTheme();
    const sectionRef = useRef(null);

    const items = [
        { image: '/assets/gallery/last_frame.png', text: 'The Last Frame' },
        { image: '/assets/gallery/neon_nights.png', text: 'Neon Nights' },
        { image: '/assets/gallery/legacy.png', text: 'Legacy' },
        { image: '/assets/gallery/digital_zen.png', text: 'Digital Zen' },
        { image: '/assets/gallery/visionary.png', text: 'Visionary' }
    ];

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return (
        <section 
            id="gallery" 
            ref={sectionRef}
            className={`scroll-section h-screen w-full overflow-hidden relative transition-colors duration-1000 bg-transparent`}
        >
            <div className="absolute top-4 left-4 md:top-6 md:left-8 z-10 pointer-events-none">
                <h2 className={`text-xl md:text-5xl font-serif tracking-tighter italic transition-colors duration-1000 ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>Global Showcase</h2>
                <div className="h-[1px] md:h-[2px] w-6 md:w-16 bg-orange-600 mt-1 md:mt-4 mb-1 md:mb-4"></div>
                <p className="text-orange-600 tracking-[0.1em] md:tracking-[0.5em] text-[5px] md:text-[10px] uppercase font-bold opacity-80">
                    {isMobile ? 'Scroll to explore' : 'Scroll to explore our vision'}
                </p>
            </div>

            <div className="w-full h-full relative">
                <CircularGallery 
                    items={items} 
                    bend={isMobile ? 1.5 : 3} 
                    textColor={isDarkMode ? "#ffffff" : "#000000"} 
                    borderRadius={isMobile ? 0.03 : 0.05} 
                    font={isMobile ? "bold 14px Outfit" : "bold 24px Outfit"}
                    scrollEase={0.08}
                />
            </div>
        </section>
    );
};

export default SectionShowcase;


