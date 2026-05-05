import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

const SectionProduction = () => {
    const { isDarkMode } = useTheme();
    
    return (
        <section id="services" className={`scroll-section min-h-screen w-full flex items-center justify-center relative overflow-hidden py-24 md:py-0 transition-colors duration-1000 bg-transparent`}>
            {/* Global background used */}

            <div className="max-w-6xl w-full px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 relative z-10">
                {[
                    { title: "Cinematography", desc: "Ultra-high-definition visual storytelling." },
                    { title: "Visual Arts", desc: "Digital landscapes that push boundaries." },
                    { title: "Entertainment", desc: "Live-action spectacles and immersive media." }
                ].map((item, i) => (
                    <div key={i} className={`animate-item group p-8 md:p-10 backdrop-blur-md border transition-all duration-500 hover:-translate-y-2 rounded-2xl ${
                        isDarkMode 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                    }`}>
                        <h3 className={`text-2xl font-serif mb-4 italic transition-colors duration-1000 ${isDarkMode ? 'text-white' : 'text-stone-900'} group-hover:text-orange-500`}>{item.title}</h3>
                        <p className={`text-sm leading-relaxed transition-colors duration-1000 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SectionProduction;
