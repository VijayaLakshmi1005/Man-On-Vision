import { useTheme } from '../../../context/ThemeContext';

const SectionEntertainment = () => {
    const { isDarkMode } = useTheme();
    
    return (
        <section className={`scroll-section min-h-screen w-full flex items-center justify-center overflow-hidden relative py-20 md:py-0 transition-colors duration-1000 bg-transparent`}>
            {/* Global background used */}

            {/* Background Parallax Element */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <h2 className={`text-[30vw] font-serif font-black tracking-tighter select-none ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>SPECTACLE</h2>
            </div>

            <div className="max-w-4xl text-center px-10 relative z-10">
                <h2 className={`animate-item text-5xl md:text-9xl font-serif tracking-tighter mb-8 italic transition-colors duration-1000 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Immersive <br /> <span className="text-orange-600">Experiences</span>
                </h2>
                <p className={`animate-item text-base md:text-xl font-serif max-w-xl mx-auto border-t pt-8 transition-all duration-1000 ${
                    isDarkMode ? 'text-stone-400 border-white/10' : 'text-stone-500 border-stone-200'
                }`}>
                    Entertainment is an emotion. Our production capabilities extend into large-scale event management and immersive digital spectacles.
                </p>
            </div>
        </section>
    );
};

export default SectionEntertainment;
