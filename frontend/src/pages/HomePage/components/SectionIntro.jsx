import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

const SectionIntro = () => {
    const { isDarkMode } = useTheme();

    return (
        <section id="about" className={`scroll-section min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-1000 py-20 md:py-0 bg-transparent`}>
            {/* Global background used */}

            <div className="text-center px-6 md:px-10 relative z-10">
                <h2 className={`animate-item text-5xl md:text-8xl font-serif tracking-tighter italic mb-8 transition-colors duration-1000 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Directing the <br className="md:hidden" /> <span className="text-orange-600">Future</span>
                </h2>
                <p className={`animate-item max-w-2xl mx-auto text-base md:text-lg leading-relaxed tracking-wide font-light transition-colors duration-1000 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    We are more than a production house. We are architects of digital legacies,
                    curating immersive experiences that transcend the traditional boundaries
                    of entertainment.
                </p>
            </div>
        </section>
    );
};

export default SectionIntro;
