import React from 'react';
import { motion } from 'framer-motion';

const NewHeroSection = () => {
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

  const slideDownVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } 
    }
  };

  const slideDownCenterVariants = {
    hidden: { y: -20, opacity: 0, x: "-50%" },
    visible: { 
      y: 0, 
      opacity: 1, 
      x: "-50%",
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full h-screen overflow-hidden text-[#151515] font-sans"
      style={{ backgroundColor: '#d6b899' }}
    >
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <motion.img 
          initial="hidden"
          animate="visible"
          variants={imageVariants}
          src="/assets/heroMOV.png" 
          alt="Founder Illustration"
          draggable="false"
          className="w-full h-full object-contain object-[right_bottom] select-none"
        />
      </div>

      {/* --- UI LAYER (Absolute Positioned for Perfect Replication) --- */}

      {/* --- FULL LEFT COLUMN --- */}
      {/* Container orchestrates the staggering sequence of all left-side elements */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="absolute top-[2.5%] bottom-[6%] left-[4%] z-50 flex flex-col items-start select-none w-1/2"
      >
        
        {/* Center Text Block */}
        <div className="flex flex-col mt-[16vh] mb-auto pb-[6vh]">
          {/* Small Header */}
          <motion.div variants={slideUpVariants} className="font-['Inter'] text-[0.7vw] font-bold tracking-[0.2vw] uppercase text-[#151515] mb-[1vh]">
            Media Production Company
          </motion.div>
          
          {/* Huge Hero Title - Staggered Letter Reveal (Drops from TOP) */}
          <div className="font-['Bebas_Neue'] text-[7.5vw] leading-[0.85] uppercase flex flex-col tracking-wider -ml-[0.3vw]">
            <div className="overflow-hidden pt-[0.5vw]">
              <motion.div variants={textRevealVariants} className="text-[#151515] origin-top-left">MAN</motion.div>
            </div>
            <div className="overflow-hidden pt-[0.5vw]">
              <motion.div variants={textRevealVariants} className="text-[#151515] origin-top-left">ON</motion.div>
            </div>
            <div className="overflow-hidden pt-[0.5vw]">
              <motion.div variants={textRevealVariants} className="text-[#F53171] origin-top-left">VISION</motion.div>
            </div>
          </div>

          {/* Tagline */}
          <motion.div variants={slideUpVariants} className="mt-[2vh] font-['Inter'] text-[1vw] leading-[1.4] font-medium tracking-[0.05vw] text-[#151515]">
            <span className="text-[#F53171]">VISION</span> <span>FUELS STORIES.</span><br/>
            <span>WE BRING THEM TO LIFE.</span>
          </motion.div>

          {/* CTA */}
          <motion.div variants={slideUpVariants} className="mt-[4vh] group inline-block w-fit cursor-pointer">
            <div className="flex items-center gap-[0.5vw] text-[#F53171] font-['Inter'] text-[0.75vw] font-bold tracking-[0.15vw] uppercase">
              EXPLORE OUR WORK
              <span className="text-[1vw] font-normal group-hover:translate-x-[4px] group-hover:-translate-y-[4px] transition-transform">↗</span>
            </div>
            {/* The line below the CTA */}
            <div className="w-full h-[1px] bg-[#F53171] mt-[0.5vw] opacity-40 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
        </div>

        {/* Social Links (Pinned to Bottom) */}
        <motion.div variants={slideUpVariants} className="flex items-center gap-[1vw] font-['Inter'] font-semibold text-[0.7vw] tracking-[0.2vw] text-[#151515]">
          <a href="#" className="hover:text-[#F53171] transition-colors">IG</a>
          <span className="opacity-20 font-light">|</span>
          <a href="#" className="hover:text-[#F53171] transition-colors">IN</a>
          <span className="opacity-20 font-light">|</span>
          <a href="#" className="hover:text-[#F53171] transition-colors">YT</a>
        </motion.div>

      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial="hidden" animate="visible" variants={slideUpVariants} transition={{ delay: 1 }}
        className="absolute bottom-[6%] right-[4%] z-50 flex flex-col items-center gap-[0.8vw] select-none"
      >
        {/* Line and Dot Container */}
        <div className="relative w-[0.6vw] h-[5vw]">
          {/* Vertical grey line (masked for animation) */}
          <div className="w-[1px] h-[5vw] bg-black/20 absolute left-1/2 -translate-x-1/2 top-0 overflow-hidden">
            {/* Animated line inside */}
            <motion.div 
              initial={{ y: "-100%" }}
              animate={{ y: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-full h-1/2 bg-black/40 absolute top-0"
            />
          </div>
          {/* Pink dot at the very bottom (Unmasked!) */}
          <div className="w-[0.6vw] h-[0.6vw] bg-[#F53171] rounded-full absolute -bottom-[0.3vw] left-0 z-10" />
        </div>
        
        {/* Scroll Text */}
        <span className="font-['Inter'] text-[0.6vw] font-bold tracking-[0.2vw] text-[#151515] uppercase">
          SCROLL
        </span>
      </motion.div>

    </motion.div>
  );
};

export default NewHeroSection;
