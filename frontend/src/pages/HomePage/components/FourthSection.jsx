import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FourthSection = () => {
  const containerRef = useRef(null);

  const services = [
    { src: '/assets/gallery/digital_zen.png', title: 'CINEMATOGRAPHY' },
    { src: '/assets/gallery/neon_nights.png', title: 'POST-PRODUCTION' },
    { src: '/assets/gallery/visionary.png', title: 'CREATIVE DIR.' },
    { src: '/assets/gallery/legacy.png', title: 'CONCEPTUALIZATION' }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Position images completely off-screen initially
      // 1st: top, 2nd: bottom, 3rd: top, 4th: bottom
      gsap.set('.reveal-img-0', { yPercent: -100 });
      gsap.set('.reveal-img-1', { yPercent: 100 });
      gsap.set('.reveal-img-2', { yPercent: -100 });
      gsap.set('.reveal-img-3', { yPercent: 100 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top", // Trigger exactly when section hits the top of viewport
          end: "+=4000",    // Explicit 4000px of scroll distance to ensure long enough scroll length
          scrub: 0.5,       // Tight scrub so it responds immediately to scroll
          pin: true,        // Pin the section
          pinSpacing: true, // Ensures it adds empty scrollable space to the page
          anticipatePin: 1
        }
      });

      // We add each reveal sequentially with a clear pause in between
      // so it is OBVIOUS they appear one after the other based on scroll.
      
      tl.to('.reveal-img-0', { yPercent: 0, ease: 'none', duration: 1 })
        .to({}, { duration: 0.2 }) // pause before next
        .to('.reveal-img-1', { yPercent: 0, ease: 'none', duration: 1 })
        .to({}, { duration: 0.2 }) // pause before next
        .to('.reveal-img-2', { yPercent: 0, ease: 'none', duration: 1 })
        .to({}, { duration: 0.2 }) // pause before next
        .to('.reveal-img-3', { yPercent: 0, ease: 'none', duration: 1 });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      
      {/* Custom Image Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center" 
        style={{ backgroundImage: "url('/assets/MOVbg4.png')" }}
      />

      {/* 4 Equal Background Columns (Now positioned IN FRONT of the text) */}
      <div className="absolute inset-0 z-20 flex w-full h-full pointer-events-none">
        {services.map((service, idx) => (
          <div key={idx} className="relative flex-1 h-full overflow-hidden">
            <div 
              className={`reveal-img-${idx} absolute inset-0 w-full h-full bg-cover bg-center will-change-transform flex items-center justify-center`}
              style={{ backgroundImage: `url('${service.src}')` }}
            >
              {/* Vertical Text Overlay */}
              <div 
                className="relative z-10 text-white font-['Bebas_Neue'] text-[4vw] md:text-[5vw] tracking-[0.15em] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]" 
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {service.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Center Content Overlaid (Now positioned BEHIND the images) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        
        <h2 className="font-['Bebas_Neue'] text-[clamp(80px,12vw,160px)] text-white leading-[0.85] uppercase tracking-wider text-center flex flex-wrap justify-center gap-x-[2vw] drop-shadow-2xl">
          <span>OUR</span> <span className="text-[#F53171]">SERVICES</span>
        </h2>

        {/* Filling Tagline Text */}
        <p className="mt-[4vh] font-['Inter'] text-[clamp(14px,1vw,18px)] leading-[1.6] font-medium text-white/90 text-center max-w-[450px] drop-shadow-lg">
          From conceptualization to the final cinematic cut, we craft tailored visual experiences that transcend boundaries and bring your boldest ideas to life.
        </p>

        {/* CTA Link matching previous sections */}
        <div className="mt-[4vh] group inline-flex flex-col items-center cursor-pointer pointer-events-auto">
          <div className="flex items-center gap-[8px] text-[#FF1D48] font-['Inter'] text-[14px] font-bold tracking-[0.15em] uppercase drop-shadow-md">
            SHARE YOUR VISION
            <span className="text-[18px] font-normal group-hover:translate-x-[4px] group-hover:-translate-y-[4px] transition-transform">↗</span>
          </div>
          <div className="w-full h-[1px] bg-[#FF1D48]/40 mt-[8px] group-hover:bg-[#FF1D48] transition-colors" />
        </div>

      </div>

    </section>
  );
};

export default FourthSection;
