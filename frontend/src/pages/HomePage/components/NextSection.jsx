import React from 'react';
import { motion } from 'framer-motion';

const NextSection = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const textRevealVariants = {
    hidden: { y: "-110%", opacity: 0, rotate: -2 },
    visible: {
      y: "0%",
      opacity: 1,
      rotate: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const slideUpVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] }
    }
  };

  const imageVariants = {
    hidden: { scale: 1.05, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: "easeOut" }
    }
  };

  return (
    <div className="relative w-full h-screen font-sans overflow-hidden" style={{ backgroundColor: '#d6b899' }}>

      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 flex items-start justify-center pointer-events-none">
        <motion.img
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={imageVariants}
          src="/assets/heroMOV2.png"
          alt="MOV Illustration 2"
          draggable="false"
          className="w-full h-[85%] object-contain object-[40%_top] select-none"
        />
      </div>

      {/* --- UI LAYER --- */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="absolute inset-0 z-50 pointer-events-none"
      >

        {/* --- FULL LEFT COLUMN --- */}
        <div className="absolute top-[2.5%] bottom-[6%] left-[4%] flex flex-col items-start select-none w-1/2">

          {/* Center Text Block */}
          <div className="flex flex-col mt-[16vh] mb-auto pb-[6vh] pointer-events-auto">

            {/* Huge Hero Title */}
            <div className="font-['Bebas_Neue'] text-[7.5vw] leading-[0.85] uppercase flex flex-col tracking-wider -ml-[0.3vw]">
              <div className="overflow-hidden pt-[0.5vw]">
                <motion.div variants={textRevealVariants} className="text-[#151515] origin-top-left">VISION</motion.div>
              </div>
              <div className="overflow-hidden pt-[0.5vw]">
                <motion.div variants={textRevealVariants} className="text-[#151515] origin-top-left">HAS NO</motion.div>
              </div>
              <div className="overflow-hidden pt-[0.5vw]">
                <motion.div variants={textRevealVariants} className="text-[#F53171] origin-top-left">LIMITS.</motion.div>
              </div>
            </div>

            {/* Tagline / Paragraph */}
            <motion.div variants={slideUpVariants} className="mt-[2vh] font-['Inter'] text-[1vw] leading-[1.6] font-medium tracking-[0.02vw] text-[#151515]">
              We don't follow limits,<br />
              we transform them into<br />
              new possibilities.
            </motion.div>

            {/* CTA */}
            <motion.div variants={slideUpVariants} className="mt-[4vh] group inline-block w-fit cursor-pointer">
              <div className="flex items-center gap-[0.5vw] text-[#F53171] font-['Inter'] text-[0.75vw] font-bold tracking-[0.15vw] uppercase">
                OUR STORY
                <span className="text-[1vw] font-normal group-hover:translate-x-[4px] group-hover:-translate-y-[4px] transition-transform">↗</span>
              </div>
              {/* The line below the CTA */}
              <div className="w-full h-[1px] bg-[#F53171] mt-[0.5vw] opacity-40 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          </div>

          {/* Social Links (Pinned to Bottom) */}
          <motion.div variants={slideUpVariants} className="flex items-center gap-[1vw] font-['Inter'] font-semibold text-[0.7vw] tracking-[0.2vw] text-[#151515] pointer-events-auto">
            <a href="#" className="hover:text-[#F53171] transition-colors">IG</a>
            <span className="opacity-20 font-light">|</span>
            <a href="#" className="hover:text-[#F53171] transition-colors">IN</a>
            <span className="opacity-20 font-light">|</span>
            <a href="#" className="hover:text-[#F53171] transition-colors">YT</a>
          </motion.div>
        </div>

        {/* --- RIGHT COLUMN / DECORATIONS --- */}

        {/* Animated Trippy Vertical Text */}
        <motion.div
          variants={slideUpVariants}
          className="absolute top-1/2 right-[6%] -translate-y-1/2 flex flex-col items-center opacity-80 select-none pointer-events-auto w-[5vw]"
        >
          {/* Trippy Background Lines & Dots SVG */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[6vw] h-full -z-10 pointer-events-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
               {/* Flowing dashed center line */}
               <motion.line 
                 x1="50" y1="0" x2="50" y2="100" 
                 stroke="#F53171" strokeWidth="1.5" strokeDasharray="4 8" 
                 className="opacity-50" vectorEffect="non-scaling-stroke" 
                 animate={{ strokeDashoffset: [-12, 0] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               />
               
               {/* Breathing helix lines */}
               <motion.path 
                 d="M 10 0 Q 140 25 50 50 T 90 100" 
                 fill="none" stroke="#151515" strokeWidth="1" className="opacity-30" vectorEffect="non-scaling-stroke" 
                 animate={{ d: [
                   "M 10 0 Q 140 25 50 50 T 90 100", 
                   "M 90 0 Q -40 25 50 50 T 10 100", 
                   "M 10 0 Q 140 25 50 50 T 90 100"
                 ] }}
                 transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
               />
               <motion.path 
                 d="M 90 0 Q -40 30 50 60 T 10 100" 
                 fill="none" stroke="#151515" strokeWidth="0.5" className="opacity-20" vectorEffect="non-scaling-stroke" 
                 animate={{ d: [
                   "M 90 0 Q -40 30 50 60 T 10 100", 
                   "M 10 0 Q 140 30 50 60 T 90 100", 
                   "M 90 0 Q -40 30 50 60 T 10 100"
                 ] }}
                 transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
               />
            </svg>
          </div>

          {"STORIES LIVE FOREVER".split('').map((char, index) => {
            const wave = Math.sin(index * 0.45) * 1.6; // offset in vw
            
            return char === ' ' ? (
              <div key={index} className="h-[2vw] flex items-center justify-center">
                 {/* Pulsing pink glowing dots */}
                 <motion.div 
                   className="w-[0.4vw] h-[0.4vw] bg-[#F53171] rounded-full drop-shadow-[0_0_8px_rgba(245,49,113,0.8)]" 
                   animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
                   transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: index * 0.1 }}
                 />
              </div>
            ) : (
              <motion.span 
                key={index} 
                className="font-['Inter'] font-black text-[0.6vw] leading-[1.4] text-[#151515] uppercase relative"
                initial={{ x: `${wave}vw`, rotate: wave * 12 }}
                animate={{ 
                  x: [`${wave}vw`, `${-wave}vw`, `${wave}vw`],
                  rotate: [wave * 12, -wave * 12, wave * 12]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 8, 
                  ease: "easeInOut",
                  delay: index * 0.1 // This creates the fluid ripple!
                }}
                style={{ textShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              >
                {char}
              </motion.span>
            );
          })}
        </motion.div>

      </motion.div>
    </div>
  );
};

export default NextSection;
