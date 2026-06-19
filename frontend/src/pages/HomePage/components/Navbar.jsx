import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Clapperboard, X } from 'lucide-react';

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', to: 'home' },
    { name: 'About', to: 'about' },
    { name: 'Services', to: 'services' },
    { name: 'Portfolio', to: 'gallery' },
    { name: 'Games', to: '/games', isExternal: true },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.85,
      y: "-5%",
      x: "5%",
      transformOrigin: "top right",
      transition: {
        type: "tween",
        ease: [0.76, 0, 0.24, 1],
        duration: 0.6
      }
    },
    opened: {
      opacity: 1,
      scale: 1,
      y: "0%",
      x: "0%",
      transformOrigin: "top right",
      transition: {
        type: "tween",
        ease: [0.76, 0, 0.24, 1],
        duration: 0.6
      }
    }
  };

  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Dynamic Navigation Color Logic:
      // Slide 1 (0 - 0.8vh): Black
      // Slide 2 (0.8 - 1.8vh): White
      // Slide 3 (1.8 - 2.8vh): Black
      // Slide 4 & 5 (2.8vh+): White
      if (scrollY > vh * 0.8 && scrollY < vh * 1.8) {
        setIsDark(true);
      } else if (scrollY >= vh * 1.8 && scrollY < vh * 2.8) {
        setIsDark(false);
      } else if (scrollY >= vh * 2.8) {
        setIsDark(true);
      } else {
        setIsDark(false);
      }

      // Hide the navbar while actively scrolling (unless we are at the very top)
      if (scrollY > 50) {
        setIsScrolling(true);
        clearTimeout(scrollTimeout);

        // When scrolling stops for 300ms, show the navbar again
        scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
        }, 300);
      } else {
        // Always show if we are at the very top of the page
        setIsScrolling(false);
        clearTimeout(scrollTimeout);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const slideDownVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.2 } 
    }
  };

  const slideDownCenterVariants = {
    hidden: { y: -20, opacity: 0, x: "-50%" },
    visible: { 
      y: 0, 
      opacity: 1, 
      x: "-50%",
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.3 } 
    }
  };

  const scrollHideAnimation = { y: "-150%", opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } };
  const scrollHideCenterAnimation = { y: "-150%", opacity: 0, x: "-50%", transition: { duration: 0.3, ease: "easeInOut" } };

  return (
    <>
      {/* Small M Logo */}
      <motion.div 
        initial="hidden" 
        animate={isScrolling ? scrollHideAnimation : "visible"} 
        variants={slideDownVariants}
        className="fixed top-[3%] left-[4%] z-[100] flex items-center select-none pointer-events-auto"
      >
        <img 
          src="/assets/Logo.png" 
          alt="MOV Icon" 
          draggable="false"
          className="h-[3vw] min-h-[40px] max-h-[60px] w-auto mix-blend-multiply"
        />
      </motion.div>

      {/* Desktop Center Navigation (Hidden on Mobile) */}
      <motion.div 
        initial="hidden" 
        animate={isScrolling ? scrollHideCenterAnimation : "visible"} 
        variants={slideDownCenterVariants}
        className={`fixed top-[4%] left-[50%] z-[100] hidden md:flex gap-[4vw] items-center font-['Inter'] font-bold text-[0.7vw] tracking-[0.2vw] uppercase select-none transition-colors duration-300 pointer-events-auto ${isDark ? 'text-white' : 'text-[#151515]'}`}
      >
        {['Home', 'About', 'Work', 'Services', 'Contact'].map(item => (
          <a key={item} href="#" className="relative group hover:text-[#F53171] transition-colors">
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#F53171] transition-all duration-300 group-hover:w-full"></span>
          </a>
        ))}
      </motion.div>

      {/* Cinematic Clapperboard Menu Button */}
      <motion.div 
        initial="hidden" 
        animate={isScrolling ? scrollHideAnimation : "visible"} 
        variants={slideDownVariants}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-[4%] right-[4%] z-[500] flex items-center justify-center cursor-pointer group select-none transition-all duration-500 pointer-events-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${
          isDark || isOpen
            ? 'text-white hover:text-[#F53171]' 
            : 'text-[#151515] hover:text-[#F53171]'
        }`}
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -180, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 180, scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                className="absolute flex items-center justify-center"
              >
                <X size={24} strokeWidth={1.5} />
              </motion.div>
            ) : (
              <motion.div
                key="clapper"
                initial={{ rotate: 180, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -180, scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                className="absolute flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12"
              >
                <Clapperboard size={24} strokeWidth={1.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Side Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-[400] pointer-events-none" key="menu-wrapper">
            {/* Backdrop for the rest of the screen (optional, keeping it subtle) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
            />

            <motion.div
              initial="closed"
              animate="opened"
              exit="closed"
              variants={menuVariants}
              className="fixed top-0 right-0 bottom-0 md:bottom-auto md:top-[10%] md:right-[3%] md:h-fit w-[70vw] md:w-[240px] z-[450] bg-[#E3D5BA] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col pointer-events-auto overflow-hidden md:rounded-3xl border-l md:border border-[#151515]/10 origin-top-right text-[#151515]"
              data-lenis-prevent
            >
              {/* Minimal Floral Trippy Pattern */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] flex items-center justify-center overflow-hidden mix-blend-multiply">
                <motion.svg 
                  viewBox="0 0 100 100" 
                  className="w-[200%] h-[200%] absolute"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                >
                  {Array.from({length: 6}).map((_, i) => (
                    <ellipse 
                      key={`petal-${i}`}
                      cx="50" cy="50" rx="45" ry="12"
                      transform={`rotate(${i * 30} 50 50)`}
                      fill="none" 
                      stroke="#151515" 
                      strokeWidth="0.2"
                    />
                  ))}
                </motion.svg>
              </div>

              {/* Menu Content */}
              <div className="relative z-10 flex flex-col h-full px-8 py-16 md:p-8 justify-between gap-8 md:gap-6">
                
                {/* Header (Top) */}
                <div className="flex flex-col gap-2">
                  <span className="font-['Inter'] text-[0.55rem] font-bold tracking-[0.2em] uppercase text-[#151515]/40">
                    <span className="md:hidden">Navigation</span>
                    <span className="hidden md:inline">Actions</span>
                  </span>
                  <div className="w-6 h-[1px] bg-[#151515]/20"></div>
                </div>

                {/* Links (Middle) - Hidden on Desktop since they have top center nav */}
                <div className="flex flex-col space-y-6 my-auto md:hidden">
                  {navLinks.map((link, i) => (
                    <div key={link.to} className="overflow-hidden group">
                      <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 50, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 * i + 0.3 }}
                      >
                        {link.isExternal ? (
                          <RouterLink
                            to={link.to}
                            onClick={() => setIsOpen(false)}
                            className="relative text-[2.5rem] md:text-[2.2rem] font-serif italic tracking-tighter text-[#151515] inline-block leading-[0.9] transition-transform duration-500 group-hover:translate-x-2 pb-2"
                          >
                            <span className="relative z-10">{link.name}</span>
                            <span className="absolute inset-0 text-transparent [-webkit-text-stroke:1px_#F53171] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500 z-0">{link.name}</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#151515] transition-all duration-500 group-hover:w-full z-10"></span>
                          </RouterLink>
                        ) : (
                          <ScrollLink
                            to={link.to}
                            smooth={true}
                            duration={1000}
                            onClick={() => setIsOpen(false)}
                            className="relative text-[2.5rem] md:text-[2.2rem] font-serif italic tracking-tighter text-[#151515] inline-block leading-[0.9] transition-transform duration-500 group-hover:translate-x-2 cursor-pointer pb-2"
                          >
                            <span className="relative z-10">{link.name}</span>
                            {/* Trippy illusion echo effect on hover */}
                            <span className="absolute inset-0 text-transparent [-webkit-text-stroke:1px_#F53171] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500 z-0">{link.name}</span>
                            <span className="absolute inset-0 text-transparent [-webkit-text-stroke:1px_#151515] opacity-0 group-hover:opacity-30 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all duration-700 z-0">{link.name}</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#151515] transition-all duration-500 group-hover:w-full z-10"></span>
                          </ScrollLink>
                        )}
                      </motion.div>
                    </div>
                  ))}
                </div>

                {/* Footer (Bottom) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col gap-6 md:gap-5 pt-6 md:pt-5 border-t border-[#151515]/10"
                >
                  {/* Desktop Games Link */}
                  <RouterLink 
                      to="/games" 
                      onClick={() => setIsOpen(false)}
                      className="group w-fit cursor-pointer hidden md:inline-block relative pb-1"
                  >
                    <div className="flex items-center justify-center gap-2 text-[#151515] font-serif italic text-[1.4rem] tracking-tighter">
                      Games
                      <span className="text-[1rem] font-sans not-italic group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-transform text-[#F53171]">↗</span>
                    </div>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#151515] transition-all duration-300 group-hover:w-full"></span>
                  </RouterLink>

                  <RouterLink 
                      to="/quote" 
                      onClick={() => setIsOpen(false)}
                      className="group inline-block w-fit cursor-pointer relative pb-1"
                  >
                    <div className="flex items-center justify-center gap-2 text-[#151515] font-serif italic text-[1.4rem] tracking-tighter">
                      Start Production
                      <span className="text-[1rem] font-sans not-italic group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-transform text-[#F53171]">↗</span>
                    </div>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#151515] transition-all duration-300 group-hover:w-full"></span>
                  </RouterLink>
                  
                  <div className="flex flex-col gap-2 mt-4 md:mt-2">
                    <span className="font-['Inter'] text-[0.45rem] font-bold tracking-[0.2em] uppercase text-[#151515]/40 mb-0.5">Access</span>
                    {user ? (
                        <button onClick={() => { logout(); setIsOpen(false); }} className="text-left text-[0.65rem] font-['Inter'] font-semibold uppercase tracking-[0.15em] text-[#151515] opacity-70 hover:opacity-100 hover:text-[#F53171] transition-colors w-fit">Sign Out</button>
                    ) : (
                        <RouterLink to="/auth" onClick={() => setIsOpen(false)} className="text-[0.65rem] font-['Inter'] font-semibold uppercase tracking-[0.15em] text-[#151515] opacity-70 hover:opacity-100 hover:text-[#F53171] transition-colors w-fit">Client Portal</RouterLink>
                    )}
                  </div>
                </motion.div>
                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
