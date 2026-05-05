import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useGSAPAnimations = (rootRef) => {
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            window.heroTwirl = 0;

            // 1. CINEMATIC OVERLAY TRANSITION (THE FLOW)
            const introTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#intro-container",
                    start: "top top",
                    end: "+=200%",     // Perfect scroll distance
                    scrub: 1.2,        
                    pin: true,         
                    pinSpacing: true,  
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        window.heroTwirl = self.progress * 20; 
                    }
                }
            });

            introTl
                .to("#hero-logo-container", {
                    scale: 150,
                    ease: "power2.in",
                    duration: 3
                })
                .to("#hero-logo-container", {
                    opacity: 0,
                    duration: 0.5
                }, "-=0.5")
                .to("#hero-canvas", {
                    opacity: 0,
                    filter: "blur(100px)",
                    duration: 2.5
                }, 0.5)

                .fromTo("#flow-section", 
                    { opacity: 0, scale: 0.5, pointerEvents: "none" },
                    {
                        opacity: 1,
                        scale: 1,
                        pointerEvents: "auto",
                        duration: 2.0,
                        ease: "power2.out"
                    }, 
                    "-=1.5"
                );

            // 2. STORYTELLING SECTIONS - STACKED SYSTEM
            const sections = gsap.utils.toArray('.scroll-section');
            
            sections.forEach((section, index) => {
                // Skip 'about' as it is part of the intro overlay
                if (section.id === 'about') return;

                // Ensure a clean starting state
                gsap.set(section, { 
                    zIndex: index + 10,
                    position: 'relative' 
                });

                // --- ITEM ANIMATIONS (Zoom In) ---
                gsap.fromTo(section.querySelectorAll('.animate-item'),
                    { opacity: 0, y: 50, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        stagger: 0.2,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 80%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );

                // --- PINNING LOGIC ---
                if (section.id === 'gallery') {
                    // HORIZONTAL SCROLL PINNING (Showcase)
                    const content = section.querySelector('#horizontal-scroll-content');
                    if (content) {
                        gsap.to(content, {
                            x: () => -(content.scrollWidth - window.innerWidth),
                            ease: "none",
                            scrollTrigger: {
                                trigger: section,
                                start: "top top",
                                end: () => `+=${content.scrollWidth}`,
                                scrub: 1,
                                pin: true,
                                pinSpacing: true, // This is key to pushing the next section down
                                invalidateOnRefresh: true,
                                onLeave: () => gsap.to(section, { opacity: 0, duration: 0.5 }),
                                onEnterBack: () => gsap.to(section, { opacity: 1, duration: 0.5 })
                            }
                        });
                    }
                } else {
                    // STANDARD SECTION PINNING
                    const isLastSection = index === sections.length - 1;

                    ScrollTrigger.create({
                        trigger: section,
                        start: "top top",
                        end: "+=100%", // Pin for exactly one screen height
                        pin: true,
                        pinSpacing: true, 
                        scrub: true,
                        invalidateOnRefresh: true,
                        onLeave: () => {
                            if (!isLastSection) {
                                gsap.to(section, { opacity: 0, duration: 0.5 });
                            }
                        },
                        onEnterBack: () => gsap.to(section, { opacity: 1, duration: 0.5 })
                    });
                }
            });

        }, rootRef);

        return () => ctx.revert();
    }, [rootRef]);
};

export default useGSAPAnimations;
