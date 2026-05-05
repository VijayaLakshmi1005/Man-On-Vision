import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

const SectionVision = () => {
    const { isDarkMode } = useTheme();
    
    return (
        <section id="vision" className={`scroll-section min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-1000 py-24 md:py-0 bg-transparent`}>
            {/* Global background used */}

            <div className="max-w-4xl text-center px-10 relative z-10">
                <h2 className={`animate-item text-5xl md:text-8xl font-serif tracking-tighter italic mb-8 transition-colors duration-1000 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Our <span className="text-orange-600">Vision</span>
                </h2>
                <p className={`animate-item max-w-2xl mx-auto text-base md:text-lg leading-relaxed tracking-wide font-light transition-colors duration-1000 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    We believe in the power of visual storytelling to bridge the gap between 
                    imagination and reality. Every frame we create is a testament to our 
                    commitment to excellence and innovation in the digital arts.
                </p>
                <div className="animate-item mt-12 w-12 h-12 border border-orange-600/30 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping" />
                </div>
            </div>
        </section>
    );
};

export default SectionVision;
