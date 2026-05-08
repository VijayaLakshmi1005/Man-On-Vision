import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Play } from 'lucide-react';

const GuestNameModal = ({ isOpen, onComplete, initialName = '' }) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    localStorage.setItem('guest_name', name.trim());
    onComplete(name.trim());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-md glass-luxury p-10 rounded-[40px] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-50" />
            
            <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-luxury-gold/20">
              <User className="text-luxury-gold" size={32} />
            </div>

            <h2 className="font-serif text-3xl text-white mb-2">Identify Yourself</h2>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Establish your Hall of Fame Presence</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(false); }}
                  placeholder="ENTER YOUR FULL NAME"
                  className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} px-6 py-5 rounded-[24px] !text-white text-center font-bold tracking-widest outline-none focus:border-luxury-gold transition-all uppercase placeholder:text-stone-600`}
                  autoFocus
                />
                {error && <p className="text-red-500 text-[9px] font-bold mt-2 tracking-widest uppercase">Name is required to register ranking</p>}
              </div>

              <button 
                type="submit"
                className="w-full btn-luxury-primary py-5 flex items-center justify-center gap-3 group"
              >
                <span>COMMENCE CHALLENGE</span>
                <Play size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuestNameModal;
