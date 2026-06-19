import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import NewHeroSection from './components/NewHeroSection';
import NextSection from './components/NextSection';
import WorkProfileSection from './components/WorkProfileSection';
import FourthSection from './components/FourthSection';
import ContactSection from './components/ContactSection';

const HomePage = () => {
    const mainRef = useRef(null);
    const [stickyState, setStickyState] = useState({ x: 208, y: 1761, w: 268, isSaved: false });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Initial setup for the background fade-in
        gsap.to(mainRef.current, {
            opacity: 1,
            duration: 1,
            ease: 'power2.inOut',
        });
    }, []);

    return (
        <main 
            ref={mainRef} 
            className="relative w-full min-h-screen opacity-0"
            style={{ backgroundColor: '#d6b899' }}
        >
            {/* Universal Navbar */}
            <Navbar />



            {/* Content Container fully responsive */}
            <div className="relative z-10 w-full h-full flex flex-col">
                <NewHeroSection />
                <NextSection />
                <WorkProfileSection />
                <FourthSection />
                <ContactSection />
            </div>
        </main>
    );
};

export default HomePage;
