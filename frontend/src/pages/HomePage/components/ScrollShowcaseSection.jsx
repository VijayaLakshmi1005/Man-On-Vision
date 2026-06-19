import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const IMAGE_SETS = [
    [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1618005191264-b0429f957eb0?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=800&auto=format&fit=crop'
    ],
    [
        'https://images.unsplash.com/photo-1512413910609-b4cb4659ebdd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'
    ],
    [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1529156069898-49953eb1b5b6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1531297121226-5b306b8c9f56?auto=format&fit=crop&w=800&q=80'
    ],
    [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80'
    ],
    [
        'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507238692062-5a042e9e623f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
    ],
];

const ScrollShowcaseSection = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const totalSets = IMAGE_SETS.length;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: `+=${totalSets * 120}%`, // Gives plenty of scroll space for 5 sets
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                }
            });

            // For each set transition
            for (let setIndex = 1; setIndex < totalSets; setIndex++) {
                const prevIndex = setIndex - 1;
                
                const subTl = gsap.timeline();

                [0, 1, 2, 3].forEach((slotIndex) => {
                    // Slot 1 (0) and 3 (2) move top->bottom
                    // Slot 2 (1) and 4 (3) move bottom->top
                    const dir = (slotIndex === 0 || slotIndex === 2) ? 1 : -1;

                    const currentImg = `.slot-${slotIndex}-img-${prevIndex}`;
                    const nextImg = `.slot-${slotIndex}-img-${setIndex}`;

                    // Set up the incoming image initial position if not already set
                    // It should be off-screen
                    gsap.set(nextImg, {
                        yPercent: dir * -120,
                        scale: 0.9,
                        filter: 'blur(10px)',
                        opacity: 0,
                    });

                    // currentImg exits
                    subTl.to(currentImg, {
                        yPercent: dir * 120,
                        scale: 0.9,
                        filter: 'blur(10px)',
                        opacity: 0,
                        duration: 1.2,
                        ease: "power4.inOut"
                    }, slotIndex * 0.08);

                    // nextImg enters
                    subTl.to(nextImg, {
                        yPercent: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        opacity: 1,
                        duration: 1.2,
                        ease: "power4.inOut"
                    }, slotIndex * 0.08);
                });

                // Add to main timeline with a little pause between transitions
                tl.add(subTl);
                tl.to({}, { duration: 0.3 }); // pause between set changes
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section 
            ref={sectionRef} 
            className="relative w-full h-screen overflow-hidden bg-[#d6b899] flex items-center justify-center"
        >
            <div className="w-full h-full p-[4vw] md:p-[8vw] flex gap-[2vw] max-w-[2000px] mx-auto">
                {[0, 1, 2, 3].map((slotIndex) => (
                    <div key={slotIndex} className="relative flex-1 h-full overflow-hidden rounded-xl bg-black/5 shadow-2xl">
                        {IMAGE_SETS.map((set, setIndex) => {
                            const isInitial = setIndex === 0;
                            const dir = (slotIndex === 0 || slotIndex === 2) ? 1 : -1;
                            const initialY = isInitial ? 0 : (dir * -120);

                            return (
                                <img
                                    key={setIndex}
                                    className={`slot-${slotIndex}-img-${setIndex} absolute inset-0 w-full h-full object-cover origin-center will-change-transform`}
                                    src={set[slotIndex]}
                                    alt={`Slot ${slotIndex} Set ${setIndex}`}
                                    style={{
                                        transform: `translateY(${initialY}%) scale(${isInitial ? 1 : 0.9})`,
                                        opacity: isInitial ? 1 : 0,
                                        filter: `blur(${isInitial ? '0px' : '10px'})`,
                                    }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            
            {/* Subtle Overlay Text to give it that premium feel */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-[4vw] md:p-[8vw] z-10">
                <div className="flex justify-between items-start font-['Inter'] text-[0.8vw] tracking-[0.2em] font-semibold text-white mix-blend-difference opacity-80 uppercase">
                    <span>Showcase</span>
                    <span>01 — 05</span>
                </div>
                <div className="flex justify-between items-end font-['Inter'] text-[0.8vw] tracking-[0.2em] font-semibold text-white mix-blend-difference opacity-80 uppercase">
                    <span>Scroll to explore</span>
                    <span>Continuous Flow</span>
                </div>
            </div>
        </section>
    );
};

export default ScrollShowcaseSection;
