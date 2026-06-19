import React from 'react';
import { motion } from 'framer-motion';
import CinematicCarouselSection from './CinematicCarouselSection';
import EditableElement from './AdminEditor/EditableElement';

const WorkProfileSection = () => {

  return (
    <section 
      className="relative w-full h-screen bg-[#d6b899] overflow-hidden font-sans flex items-center justify-center pt-[100px] pb-[40px]"
      style={{ backgroundImage: `url('/assets/MOVbg3.png')`, backgroundSize: '100% 100%', backgroundPosition: 'center' }}
    >
      <div className="w-full px-[6vw] flex items-center justify-between max-w-[1800px] mx-auto h-full">
        
        {/* LEFT CONTENT */}
        <div className="flex flex-col w-[40%] min-w-[300px] h-full justify-between pb-[20px]">
          {/* Main Text (Vertically Centered via margin auto) */}
          <motion.div 
            className="my-auto z-50 relative" 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          >
            <EditableElement section="workProfileSection" fieldKey="subtitle" as="p" className="font-['Inter'] font-medium text-[clamp(12px,1vw,14px)] tracking-[2px] text-[#111111] uppercase mb-[16px]">
              SELECTED WORKS
            </EditableElement>
            <h2 className="font-['Bebas_Neue'] text-[clamp(50px,5vw,100px)] leading-[0.85] font-bold tracking-normal flex flex-col mb-[24px] whitespace-nowrap">
              <EditableElement section="workProfileSection" fieldKey="titleLine1" as="span" className="text-[#111111]">VISIONS</EditableElement>
              <EditableElement section="workProfileSection" fieldKey="titleLine2" as="span" className="text-[#FF1D48]">MADE REAL</EditableElement>
            </h2>
            <div className="w-[80px] h-[6px] bg-[#FF1D48] rounded-full" />
            
            {/* New Text Block */}
            <div className="mt-[30px] flex flex-col gap-5">
              <EditableElement section="workProfileSection" fieldKey="description" as="p" className="font-['Inter'] font-medium text-[#111111] text-[clamp(14px,1.2vw,18px)] leading-[1.6] max-w-[320px] whitespace-pre-line">
                We sculpt raw imagination, <br/>
                translating bold visions into <br/>
                cinematic realities.
              </EditableElement>
              
              {/* Our Works Link */}
              <div className="group flex flex-col w-fit cursor-pointer mt-2 ml-[12px]">
                <div className="flex items-center gap-2 text-[#FF1D48] font-bold text-[12px] tracking-[0.15em] uppercase">
                  <EditableElement section="workProfileSection" fieldKey="ctaText" as="span">OUR WORKS</EditableElement> <span className="text-[14px] font-normal group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                </div>
                <div className="w-full h-[1px] bg-[#FF1D48]/40 mt-[6px] group-hover:bg-[#FF1D48] transition-colors" />
              </div>
            </div>
          </motion.div>

          {/* Locked Social Links Sticky Note (Bottom Left) */}
          <div className="relative w-full max-w-[260px] aspect-[2.5/1] bg-[#D2B48C] shadow-[4px_12px_25px_rgba(0,0,0,0.15)] flex items-center justify-center -rotate-2 pointer-events-auto mt-auto translate-y-[65px] -translate-x-[20px]" style={{ border: '2px solid #9E7D56' }}>
            {/* Top Tape */}
            <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-[35%] h-[26px] bg-[#BFA37E]/60 backdrop-blur-md shadow-sm rotate-2 border border-black/5 pointer-events-none" />
            {/* Links */}
            <div className="flex gap-[15%] font-['Inter'] font-bold text-[#2A2723] uppercase tracking-[0.3em]" style={{ fontSize: '13px' }}>
              <span className="hover:text-[#FF1D48] transition-colors cursor-pointer px-1">IG</span>
              <span className="hover:text-[#FF1D48] transition-colors cursor-pointer px-1">IN</span>
              <span className="hover:text-[#FF1D48] transition-colors cursor-pointer px-1">YT</span>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT (Cinematic Carousel) */}
        <div className="relative w-[60%] h-full flex items-center justify-center z-50 -translate-x-[80px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <CinematicCarouselSection />
          </div>
        </div>

      </div>
    </section>
  );
};

export default WorkProfileSection;
