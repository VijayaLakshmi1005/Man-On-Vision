import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_CONTACT_SECTION } from '../../../graphql/queries';

const ContactSection = () => {
  const { data, loading, error } = useQuery(GET_CONTACT_SECTION);

  const contactData = data?.contact || {
    title: "LET'S CREATE",
    email: "HELLO@MANONVISION.COM",
    instagram: "#",
    linkedin: "#",
    youtube: "#"
  };

  // Helper to color the last word pink if title has multiple words
  const titleWords = (contactData.title || "LET'S CREATE").split(' ');
  const lastWord = titleWords.pop();
  const firstWords = titleWords.join(' ');

  // SVG for the old-fashioned film tape with REAL transparent holes using an SVG mask and TORN edges
  const filmTapeSvg = `url("data:image/svg+xml;utf8,<svg width='60' height='120' xmlns='http://www.w3.org/2000/svg'><defs><filter id='torn'><feTurbulence type='fractalNoise' baseFrequency='0.15' numOctaves='3' result='noise' stitchTiles='stitch'/><feDisplacementMap in='SourceGraphic' in2='noise' scale='5' xChannelSelector='R' yChannelSelector='G'/></filter><mask id='holes'><rect width='60' height='120' fill='white' filter='url(%23torn)'/><rect x='15' y='8' width='30' height='16' rx='3' fill='black' filter='url(%23torn)'/><rect x='15' y='96' width='30' height='16' rx='3' fill='black' filter='url(%23torn)'/></mask></defs><rect width='60' height='120' fill='%23050505' mask='url(%23holes)'/></svg>")`;

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center">
      
      <style>{`
        @keyframes scrollTape {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-tape {
          animation: scrollTape 20s linear infinite;
        }
        .animate-tape-reverse {
          animation: scrollTape 25s linear infinite reverse;
        }
        .film-tape-bg {
          background-image: ${filmTapeSvg};
          background-repeat: repeat;
          background-size: 60px 120px;
        }
      `}</style>
      {/* Custom Image Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center" 
        style={{ backgroundImage: "url('/assets/MOVbg5.png')" }}
      />

      {/* Classy Spinning Sticker */}
      <div className="absolute top-12 right-12 md:top-24 md:right-24 w-32 h-32 md:w-40 md:h-40 animate-[spin_15s_linear_infinite] opacity-60 pointer-events-none z-10">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
          <text fill="#111111" className="font-['Inter'] font-bold text-[10.5px] tracking-[0.25em] uppercase">
            <textPath href="#circlePath" startOffset="0%">
              • PREMIUM CINEMATOGRAPHY • EST. 2026 
            </textPath>
          </text>
        </svg>
      </div>

      {/* TAPE 1 - Diagonal top-left to bottom-right (pushed to edge to prevent overlap) */}
      <div className="absolute top-[5%] left-[-25%] w-[150%] h-[120px] -rotate-[8deg] z-10 pointer-events-none opacity-[0.65] mix-blend-multiply contrast-125 sepia-[0.4]">
         {/* The moving container is 200% wide so it can scroll seamlessly */}
         <div className="flex h-full w-[200%] animate-tape film-tape-bg">
            {/* We render exactly identical sets of content to make the -50% jump invisible */}
            <div className="flex w-1/2 h-full justify-around items-center">
              {[...Array(4)].map((_, i) => (
                <span key={`a-${i}`} className="whitespace-nowrap font-['Bebas_Neue'] text-[#F53171] text-[60px] tracking-[0.2em] pt-2 opacity-80 blur-[0.5px]">
                  LET'S CREATE A MASTERPIECE <span className="text-[#e0d6cc] mx-8">●</span>
                </span>
              ))}
            </div>
            <div className="flex w-1/2 h-full justify-around items-center">
              {[...Array(4)].map((_, i) => (
                <span key={`b-${i}`} className="whitespace-nowrap font-['Bebas_Neue'] text-[#F53171] text-[60px] tracking-[0.2em] pt-2 opacity-80 blur-[0.5px]">
                  LET'S CREATE A MASTERPIECE <span className="text-[#e0d6cc] mx-8">●</span>
                </span>
              ))}
            </div>
         </div>
      </div>

      {/* TAPE 2 - Parallel to TAPE 1 (pushed to edge to prevent overlap) */}
      <div className="absolute bottom-[5%] left-[-25%] w-[150%] h-[120px] -rotate-[8deg] z-10 pointer-events-none opacity-[0.65] mix-blend-multiply contrast-125 sepia-[0.4]">
         <div className="flex h-full w-[200%] animate-tape-reverse film-tape-bg">
            <div className="flex w-1/2 h-full justify-around items-center">
              {[...Array(4)].map((_, i) => (
                <span key={`c-${i}`} className="whitespace-nowrap font-['Bebas_Neue'] text-[#e0d6cc] text-[60px] tracking-[0.2em] pt-2 opacity-80 blur-[0.5px]">
                  YOUR VISION, OUR LENS <span className="text-[#F53171] mx-8">●</span>
                </span>
              ))}
            </div>
            <div className="flex w-1/2 h-full justify-around items-center">
              {[...Array(4)].map((_, i) => (
                <span key={`d-${i}`} className="whitespace-nowrap font-['Bebas_Neue'] text-[#e0d6cc] text-[60px] tracking-[0.2em] pt-2 opacity-80 blur-[0.5px]">
                  YOUR VISION, OUR LENS <span className="text-[#F53171] mx-8">●</span>
                </span>
              ))}
            </div>
         </div>
      </div>

      {/* Center Contact Content */}
      <div className="relative z-20 flex flex-col items-center justify-center max-w-4xl w-[90%] text-center">
        
        <h2 className="font-['Bebas_Neue'] text-[70px] md:text-[120px] text-white leading-[0.85] mb-6 tracking-wider [-webkit-text-stroke:_1px_#000] [text-shadow:_0_4px_30px_#000,_0_0_80px_#000]">
          {firstWords} <span className="text-[#F53171] [-webkit-text-stroke:_1px_#000]">{lastWord}</span>
        </h2>
        

        {/* Classy, Minimal Link with Animated Underline */}
        <a href={`mailto:${contactData.email || "hello@manonvision.com"}`} className="group relative inline-flex items-center gap-3 text-[#111111] font-['Inter'] font-bold tracking-[0.2em] text-sm md:text-lg transition-colors [text-shadow:_0_0_15px_rgba(255,255,255,0.8),_0_0_30px_rgba(255,255,255,0.6)] mt-2">
          <span className="relative pb-1">
            {(contactData.email || "hello@manonvision.com").toUpperCase()}
            {/* Minimal Underline that expands on hover */}
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#F53171] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
          </span>
          <span className="text-xl group-hover:rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">↗</span>
        </a>

        {/* Social Links in White */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-16 font-['Inter'] font-bold text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-white [text-shadow:_0_2px_8px_#000,_0_0_20px_#000]">
          <a href={contactData.instagram || "#"} className="hover:text-[#F53171] hover:-translate-y-1 transition-all">INSTAGRAM</a>
          <span className="opacity-50 text-white">|</span>
          <a href={contactData.linkedin || "#"} className="hover:text-[#F53171] hover:-translate-y-1 transition-all">LINKEDIN</a>
          <span className="opacity-50 text-white">|</span>
          <a href={contactData.youtube || "#"} className="hover:text-[#F53171] hover:-translate-y-1 transition-all">YOUTUBE</a>
        </div>

      </div>

    </section>
  );
};

export default ContactSection;
