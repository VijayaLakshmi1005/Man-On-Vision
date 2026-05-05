import { useTheme } from '../../../context/ThemeContext';

const SectionShowcase = () => {
    const { isDarkMode } = useTheme();
    
    return (
        <section id="gallery" className={`scroll-section h-screen w-full overflow-hidden relative transition-colors duration-1000 bg-transparent`}>
            {/* Global background used */}
            
            <div className="absolute top-12 left-6 md:top-20 md:left-20 z-10">
                <h2 className={`text-3xl md:text-6xl font-serif tracking-tighter italic transition-colors duration-1000 ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>Global Showcase</h2>
                <p className="text-orange-600 tracking-[0.5em] text-[10px] uppercase font-bold mt-4">Scroll down to explore horizontally</p>
            </div>

            <div 
                id="horizontal-scroll-content" 
                className="h-full flex items-center gap-12 px-[10vw] min-w-max"
            >
                {[
                    { title: "The Last Frame", category: "Cinematic" },
                    { title: "Neon Nights", category: "Music Video" },
                    { title: "Legacy", category: "Documentary" },
                    { title: "Digital Zen", category: "Immersive" },
                    { title: "Visionary", category: "Short Film" }
                ].map((item, i) => (
                    <div 
                        key={i} 
                        className={`w-[85vw] md:w-[35vw] aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden relative group cursor-pointer border transition-colors duration-1000 ${
                            isDarkMode ? 'bg-stone-900 border-white/5' : 'bg-stone-100 border-stone-200'
                        }`}
                    >
                        {/* Placeholder for images */}
                        <div className={`absolute inset-0 transition-transform duration-700 group-hover:scale-110 ${
                            isDarkMode ? 'bg-gradient-to-br from-stone-700 to-stone-900' : 'bg-gradient-to-br from-stone-200 to-stone-300'
                        }`} />
                        <div className={`absolute inset-0 group-hover:bg-black/20 transition-all ${
                            isDarkMode ? 'bg-black/40' : 'bg-white/10'
                        }`} />
                        
                        <div className="absolute bottom-10 left-10">
                            <span className="text-orange-600 font-bold text-[10px] uppercase tracking-widest mb-2 block">{item.category}</span>
                            <h3 className={`text-3xl font-serif transition-colors duration-1000 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{item.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SectionShowcase;
