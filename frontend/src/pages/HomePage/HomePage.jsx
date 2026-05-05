import React, { useRef } from 'react';
import HeroSection from './components/HeroSection';
import SectionIntro from './components/SectionIntro';
import ScrollWrapper from './components/ScrollWrapper';
import Navbar from '../../components/Navbar';
import LiquidMazeStatic from '../../components/common/LiquidMazeStatic';
import { useTheme } from '../../context/ThemeContext';
import useGSAPAnimations from './hooks/useGSAPAnimations';

const HomePage = () => {
    const mainRef = useRef(null);
    const { isDarkMode } = useTheme();

    // Apply GSAP animations to the entire page
    useGSAPAnimations(mainRef);

    return (
        <main ref={mainRef} className={`relative w-full overflow-x-hidden transition-colors duration-1000 bg-transparent`}>
            {/* Global Continuous Background - Using the '2nd Background' preferred by user */}
            <div className="fixed inset-0 z-[-1]">
                <LiquidMazeStatic 
                    color1="#ff5a96" 
                    color2="#ffb040" 
                    bgColor={isDarkMode ? "#0c0a09" : "#fff5f2"} 
                    density={0.2} 
                    speed={0.005} 
                />
            </div>

            <Navbar />

            {/* The Integrated Intro Flow (Hero + First Story Section) */}
            <div id="intro-container" className="relative w-full overflow-hidden">
                <HeroSection />
                <div id="flow-section" className="absolute inset-0 opacity-0 pointer-events-none">
                    <SectionIntro />
                </div>
            </div>

            <ScrollWrapper />
        </main>
    );
};

export default HomePage;
