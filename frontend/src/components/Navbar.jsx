import { useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: 'Home', to: 'home' },
    { name: 'About', to: 'about' },
    { name: 'Services', to: 'services' },
    { name: 'Portfolio', to: 'gallery' },
  ];

  const handleNavClick = (to) => {
    setIsOpen(false);
    if (!isHomePage) {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(to);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const menuVariants = {
    closed: {
      clipPath: "circle(0% at 95% 5%)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    opened: {
      clipPath: "circle(150% at 95% 5%)",
      transition: {
        type: "spring",
        stiffness: 20,
        restDelta: 2
      }
    }
  };

  return (
    <>
      {/* Theme Toggle Button (Square Drawn by User) */}
      <button 
        onClick={toggleTheme}
        className={`fixed top-8 right-24 z-[200] w-12 h-12 flex items-center justify-center backdrop-blur-md border transition-all duration-500 rounded-full shadow-sm ${
          isDarkMode 
          ? 'bg-orange-600/20 border-orange-600/30 text-orange-500 hover:bg-orange-600/40' 
          : 'bg-white/10 border-white/20 text-stone-900 hover:bg-stone-100'
        }`}
      >
        <AnimatePresence mode="wait">
          {isDarkMode ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Sun size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Moon size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Hamburger Toggle (Only visible UI element) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-8 right-8 z-[200] w-12 h-12 flex items-center justify-center backdrop-blur-md border rounded-full transition-all duration-500 shadow-sm ${
          isDarkMode 
          ? 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-stone-950' 
          : 'bg-white/10 border-white/20 text-stone-900 hover:bg-stone-900 hover:text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Menu size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Expanded Menu Overlay */}
      <motion.div
        initial="closed"
        animate={isOpen ? "opened" : "closed"}
        variants={menuVariants}
        className="fixed inset-0 z-[150] bg-stone-950 text-white flex flex-col items-center justify-center py-20 overflow-y-auto"
      >
        <div className="flex flex-col items-center space-y-8 md:space-y-12">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.to}
              initial={{ y: 50, opacity: 0 }}
              animate={isOpen ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
              transition={{ delay: 0.1 * i + 0.2 }}
            >
              {isHomePage ? (
                <ScrollLink
                  to={link.to}
                  smooth={true}
                  duration={1000}
                  onClick={() => setIsOpen(false)}
                  className="text-4xl md:text-7xl font-serif italic tracking-tighter hover:text-orange-600 transition-colors cursor-pointer block"
                >
                  {link.name}
                </ScrollLink>
              ) : (
                <button
                  onClick={() => handleNavClick(link.to)}
                  className="text-4xl md:text-7xl font-serif italic tracking-tighter hover:text-orange-600 transition-colors block"
                >
                  {link.name}
                </button>
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={isOpen ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-12 flex flex-col items-center gap-6"
          >
            <RouterLink 
                to="/quote" 
                onClick={() => setIsOpen(false)}
                className="px-12 py-4 bg-orange-600 text-white rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-stone-950 transition-all"
            >
                Start Production
            </RouterLink>
            
            {user ? (
                <button onClick={() => logout()} className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100">Sign Out</button>
            ) : (
                <RouterLink to="/auth" onClick={() => setIsOpen(false)} className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100">Portal Access</RouterLink>
            )}
          </motion.div>
        </div>

        {/* Decorative background text */}
        <div className="absolute bottom-12 left-12 text-[10vw] font-serif font-black opacity-[0.02] select-none pointer-events-none">
          VISION
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;
