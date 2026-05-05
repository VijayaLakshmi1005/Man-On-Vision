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
                
                {/* 1. Zoomable Logo Icon ONLY */}
                <motion.div
                    id="hero-logo-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="relative flex items-center justify-center origin-[50%_45%]" // Precise eye focus
                >
                    {/* Glow Effect for Dark Mode */}
                    <AnimatePresence>
                        {isDarkMode && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1.1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full"
                            />
                        )}
                    </AnimatePresence>

                    <img 
                        src="/assets/MOV-logo.png" 
                        alt="Man On Vision Logo" 
                        className={`w-[200px] md:w-[450px] h-auto object-contain transition-all duration-1000 ${
                            isDarkMode 
                            ? 'drop-shadow-[0_0_50px_rgba(249,115,22,0.4)] brightness-110' 
                            : 'drop-shadow-[0_0_30px_rgba(0,0,0,0.1)]'
                        } filter`}
                    />
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
                <div className="w-[1px] h-12 bg-stone-900" />
            </div>
        </section>
    );
};

export default HeroSection;
