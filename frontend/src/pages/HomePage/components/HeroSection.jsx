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
                    className="relative flex items-center justify-center origin-[50%_42%] scale-[1] will-change-transform"
                    style={{ opacity: 1, transform: 'scale(1) translateZ(0)', backfaceVisibility: 'hidden' }}
                >
                    <div className="relative flex flex-col items-center">
                        {/* High-Fidelity Cropped Icon Symbol - Shared across modes */}
                        <img
                            src="/assets/MOV-logo.png"
                            alt="Man On Vision"
                            className={`w-[200px] md:w-[450px] h-auto object-contain transition-all duration-700 ${
                                isDarkMode ? 'brightness-110' : 'brightness-100'
                            }`}
                            style={{ 
                                clipPath: 'inset(0 0 28% 0)', 
                                marginBottom: '-13%' 
                            }}
                        />
                        
                        {/* High-Fidelity Typography - Color adapts to mode */}
                        <div className="flex flex-col items-center text-center mt-2 md:mt-4 z-10">
                            <h1 className={`text-[1.8rem] md:text-[4.5rem] font-black tracking-tight leading-[0.9] transition-colors duration-700 ${
                                isDarkMode ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'text-black'
                            }`}>
                                MAN ON VISION
                            </h1>
                            <p className={`text-[7px] md:text-[12px] tracking-[0.8em] uppercase font-semibold mt-2 md:mt-4 transition-colors duration-700 translate-x-[0.4em] ${
                                isDarkMode ? 'text-stone-400' : 'text-stone-600'
                            }`}>
                                ENTERTAINMENT
                            </p>
                        </div>
                    </div>
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
