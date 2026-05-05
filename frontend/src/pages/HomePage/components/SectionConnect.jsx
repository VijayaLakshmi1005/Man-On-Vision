import { useTheme } from '../../../context/ThemeContext';

const SectionConnect = () => {
    const { isDarkMode } = useTheme();
    
    return (
        <section className={`scroll-section min-h-screen w-full flex items-center justify-center relative overflow-hidden py-24 md:py-0 transition-colors duration-1000 bg-transparent`}>
            {/* Global background used */}

            <div className="text-center px-10 relative z-10">
                <h2 className={`animate-item text-5xl md:text-[12rem] font-serif tracking-tighter leading-none mb-10 md:mb-16 italic transition-colors duration-1000 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Let's <span className="text-orange-600">Create.</span>
                </h2>
                <div className="animate-item flex flex-col md:flex-row gap-8 items-center justify-center">
                    <button className={`w-full md:w-auto px-12 md:px-16 py-5 md:py-6 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-500 shadow-xl ${
                        isDarkMode 
                        ? 'bg-white text-stone-950 hover:bg-orange-600 hover:text-white' 
                        : 'bg-stone-950 text-white hover:bg-orange-600'
                    }`}>
                        Start Production
                    </button>
                    <button className={`w-full md:w-auto px-12 md:px-16 py-5 md:py-6 border rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-500 ${
                        isDarkMode 
                        ? 'border-white/20 text-white hover:bg-white hover:text-stone-950' 
                        : 'border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900'
                    }`}>
                        Access Portal
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SectionConnect;
