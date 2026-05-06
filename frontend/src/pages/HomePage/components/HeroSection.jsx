import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

import WaveBackground from '../../../components/common/WaveBackground';

const HeroSection = () => {
    const { isDarkMode } = useTheme();
    
    return (
        <section 
            id="home" 
            className={`relative h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-1000 bg-transparent`}
        >
            {/* Local Hero Background - Fades out on scroll to reveal global LiquidMaze */}
            <div className="absolute inset-0 z-0">
                <WaveBackground />
            </div>

            {/* Content Container */}

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                
                {/* Glow Effect moved outside of GSAP zoom container to prevent massive blur scaling */}
                <AnimatePresence>
                    {isDarkMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none z-[-1]"
                            style={{ transform: 'translateZ(0)' }}
                        />
                    )}
                </AnimatePresence>

                {/* 1. Zoomable Logo Icon - Standard div for exclusive GSAP control */}
                <div
                    id="hero-logo-container"
                    className="relative flex items-center justify-center origin-[50%_45%] will-change-transform transform-gpu" 
                    style={{ opacity: 1, transform: 'scale(1) translateZ(0)', backfaceVisibility: 'hidden' }}
                >
                    <img 
                        src="/assets/MOV-logo.png" 
                        alt="Man On Vision Logo" 
                        className={`w-[200px] md:w-[450px] h-auto object-contain transition-opacity duration-700 ${
                            isDarkMode 
                            ? 'drop-shadow-[0_0_35px_rgba(249,115,22,0.2)] brightness-110' 
                            : 'drop-shadow-[0_0_20px_rgba(0,0,0,0.05)]'
                        }`}
                    />
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
                <div className="w-[1px] h-12 bg-stone-900" />
            </div>
        </section>
    );
};

export default HeroSection;
