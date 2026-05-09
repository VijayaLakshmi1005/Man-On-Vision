import React from "react";
import { Link } from "react-router-dom";
import { Menu, Instagram, MessageSquare } from "lucide-react";

export default function Header({ toggleSidebar }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[120] lg:hidden pb-4 pt-2 px-4">
      <div className="mx-auto max-w-lg">
        <div className="bg-stone-950/80 backdrop-blur-2xl border border-white/10 rounded-full px-5 py-2.5 flex items-center justify-between shadow-2xl">
          
          {/* Brand */}
          <Link to="/portal" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white/20">
              <img src="/assets/MOV-logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white">Man On Vision</span>
          </Link>

          {/* Quick Actions & Menu Toggle */}
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/man.on.vision?utm_source=qr&igsh=aGRxMjNqdDN6cHox" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors p-1">
                <Instagram size={16} />
            </a>
            
            <div className="w-px h-4 bg-white/10 mx-1" />

            <button 
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full transition-transform active:scale-90 shadow-lg"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
