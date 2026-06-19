import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

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

      {/* Navigation */}
      <motion.div 
        initial="hidden" 
        animate={isScrolling ? scrollHideCenterAnimation : "visible"} 
        variants={slideDownCenterVariants}
        className={`fixed top-[4%] left-[50%] z-[100] flex gap-[4vw] font-['Inter'] font-bold text-[0.7vw] tracking-[0.2vw] uppercase select-none transition-colors duration-300 ${isDark ? 'text-white' : 'text-[#151515]'}`}
      >
        <a href="#" className="hover:text-[#F53171] transition-colors">Home</a>
        <a href="#" className="hover:text-[#F53171] transition-colors">About</a>
        <a href="#" className="hover:text-[#F53171] transition-colors">Work</a>
        <a href="#" className="hover:text-[#F53171] transition-colors">Services</a>
        <a href="#" className="hover:text-[#F53171] transition-colors">Contact</a>
      </motion.div>

      {/* Menu Button */}
      <motion.div 
        initial="hidden" 
        animate={isScrolling ? scrollHideAnimation : "visible"} 
        variants={slideDownVariants}
        className={`fixed top-[4%] right-[4%] z-[100] flex items-center gap-[0.8vw] cursor-pointer group select-none transition-colors duration-300 ${isDark ? 'text-white' : 'text-[#151515]'}`}
      >
        <span className="font-['Inter'] font-bold text-[0.7vw] tracking-[0.2vw] uppercase">MENU</span>
        <div className="flex flex-col gap-[0.4vw]">
          <div className="w-[1.5vw] h-[2px] bg-[#F53171] transition-colors duration-300"></div>
          <div className="w-[1.5vw] h-[2px] bg-[#F53171] transition-colors duration-300"></div>
          <div className="w-[1.5vw] h-[2px] bg-[#F53171] transition-colors duration-300"></div>
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;
