import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Image, MessageSquare, User, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

export default function MobileNav() {
  const unreadCount = useSelector(state => state.chat.clientUnreadCount);

  const navLinks = [
    { name: "Home", path: "/portal", icon: Home, exact: true },
    { name: "Photos", path: "/portal/gallery", icon: Image },
    { name: "Games", path: "/games", icon: Gamepad2 },
    { name: "Concierge", path: "/portal/chats", icon: MessageSquare, hasUnread: unreadCount > 0 },
    { name: "Profile", path: "/portal/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden pb-safe">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-2xl border-t border-white/5" />
      <div className="relative flex justify-around items-center h-16 px-4">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.exact}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center gap-1.5 min-w-[64px] transition-all duration-300
              ${isActive ? 'text-white' : 'text-white/40'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`relative p-1.5 rounded-xl transition-all duration-500 ${isActive ? 'bg-white/10' : ''}`}>
                  <link.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  {link.hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff5a96] rounded-full border border-stone-950 shadow-[0_0_10px_rgba(255,90,150,0.5)]" />
                  )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.15em]">
                  {link.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[#ff5a96] to-[#ffb040] rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
