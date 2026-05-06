import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useGSAPAnimations = (rootRef) => {
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            window.heroTwirl = 0;

            // 1. CINEMATIC OVERLAY TRANSITION (THE FLOW)
            if (document.querySelector("#intro-container")) {
                const introTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: "#intro-container",
                        start: "top top",
                        end: "+=250%",      // Optimized distance
                        scrub: 1,           // Slight smoothing (1s) instead of 'true' to prevent jitters
                        pin: true,
                        pinSpacing: true,
                        anticipatePin: 1,
                        fastScrollEnd: true, // Crucial for preventing 'stuck' states on fast scroll
                        preventOverlaps: true,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            window.heroTwirl = self.progress * 15;
                        }
                    }
                });

                if (document.querySelector("#hero-logo-container")) {
                    // Optimized Scale: 15x is plenty to cover the screen and stay within GPU limits
                    introTl.fromTo("#hero-logo-container", 
                        { scale: 1, opacity: 1 },
                        {
                            scale: 15,    
                            ease: "power2.inOut", 
                            duration: 3,
                            force3D: true,
                            overwrite: "auto"
                        }
                    )
                    .to("#hero-logo-container", {
                        opacity: 0,
                        duration: 1, // Longer fade for smoother transition
                        ease: "power1.inOut",
                    }, "-=1.5"); // Start fading halfway through the zoom
                }
                
                if (document.querySelector("#hero-canvas")) {
                    introTl.to("#hero-canvas", {
                        opacity: 0,
                        duration: 2,
                        ease: "power2.inOut"
                    }, 0.5);
                }

                if (document.querySelector("#flow-section")) {
                    introTl.fromTo("#flow-section", 
                        { opacity: 0, y: 50, scale: 0.95, pointerEvents: "none" },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            pointerEvents: "auto",
                            duration: 1.5,
                            ease: "power3.out",
                            force3D: true
                        }, 
                        "-=1.2"
                    );
                }
            }

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

                // --- SECTION FADE SCRUB ---
                const isLastSection = index === sections.length - 1;
                const isGallery = section.id === 'gallery';

                // Ensure initial visibility
                gsap.set(section, { opacity: 1 });

                if (!isLastSection && !isGallery) {
                    gsap.fromTo(section, 
                        { opacity: 1 },
                        {
                            opacity: 0,
                            ease: "power1.in",
                            scrollTrigger: {
                                trigger: section,
                                start: "bottom 20%", 
                                end: "bottom top",
                                scrub: true,
                                preventOverlaps: true,
                                fastScrollEnd: true
                            }
                        }
                    );
                }

                // --- ITEM ANIMATIONS ---
                const animateItems = section.querySelectorAll('.animate-item');
                if (animateItems.length > 0) {
                    gsap.fromTo(animateItems,
                        { opacity: 0, y: 30, scale: 0.95 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            stagger: 0.1,
                            duration: 0.8,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: section,
                                start: "top 85%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                }

                // --- PINNING LOGIC ---
                if (isGallery) {
                    const content = section.querySelector('#horizontal-scroll-content');
                    if (content) {
                        const getScrollAmount = () => -(content.scrollWidth - window.innerWidth);
                        
                        gsap.to(content, {
                            x: getScrollAmount,
                            ease: "none",
                            scrollTrigger: {
                                trigger: section,
                                start: "top top",
                                end: () => `+=${content.scrollWidth * 1.5}`,
                                scrub: 1,
                                pin: true,
                                pinSpacing: true,
                                invalidateOnRefresh: true,
                                fastScrollEnd: true,
                                preventOverlaps: true,
                                onLeave: () => gsap.to(section, { opacity: 0, duration: 0.5 }),
                                onEnterBack: () => gsap.to(section, { opacity: 1, duration: 0.5 })
                            }
                        });
                    }
                } else {
                    // STANDARD SECTION PINNING
                    ScrollTrigger.create({
                        trigger: section,
                        start: "top top",
                        end: "+=100%", 
                        pin: true,
                        pinSpacing: true, 
                        scrub: true,
                        invalidateOnRefresh: true,
                        fastScrollEnd: true,
                        preventOverlaps: true
                    });
                }
            });

        }, rootRef.current);

        return () => ctx.revert();
    }, [rootRef]);
};

export default useGSAPAnimations;
