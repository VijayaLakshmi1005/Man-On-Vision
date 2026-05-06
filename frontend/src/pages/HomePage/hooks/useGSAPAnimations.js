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
                        end: "+=300%",     // More distance = smoother, more granular control
                        scrub: true,       // Immediate response for perfect sync
                        pin: true,         
                        pinSpacing: true,  
                        anticipatePin: 1,  // Helps prevent jumps during fast scroll
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            window.heroTwirl = self.progress * 20; // Slightly more twirl for drama
                        }
                    }
                });

                if (document.querySelector("#hero-logo-container")) {
                    introTl.fromTo("#hero-logo-container", 
                        { scale: 1, opacity: 1 },
                        {
                            scale: 120,    // Slightly more zoom
                            ease: "none",  // Linear tracking with scroll is smoothest for scrub
                            duration: 3,
                            force3D: true,
                            overwrite: "auto",
                            lazy: true
                        }
                    )
                    .to("#hero-logo-container", {
                        opacity: 0,
                        duration: 0.3,
                        ease: "power1.out",
                        lazy: true
                    }, "-=0.3"); // Fade out exactly at the end
                }
                
                if (document.querySelector("#hero-canvas")) {
                    introTl.to("#hero-canvas", {
                        opacity: 0,
                        duration: 2,
                        ease: "power2.inOut",
                        lazy: true
                    }, 0.5);
                }

                if (document.querySelector("#flow-section")) {
                    introTl.fromTo("#flow-section", 
                        { opacity: 0, y: 40, scale: 0.98, pointerEvents: "none" },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            pointerEvents: "auto",
                            duration: 1.2,
                            ease: "power3.out",
                            force3D: true,
                            lazy: true
                        }, 
                        "-=0.8"
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
                // Instead of manual onLeave/onEnterBack, we use a scrubbed timeline for section opacity
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
                                scrub: true
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
                    // HORIZONTAL SCROLL PINNING (Showcase)
                    const content = section.querySelector('#horizontal-scroll-content');
                    if (content) {
                        // Calculate total scroll distance
                        const getScrollAmount = () => -(content.scrollWidth - window.innerWidth);
                        
                        gsap.to(content, {
                            x: getScrollAmount,
                            ease: "none",
                            scrollTrigger: {
                                trigger: section,
                                start: "top top",
                                end: () => `+=${content.scrollWidth * 1.5}`, // Slower speed
                                scrub: 1.2,
                                pin: true,
                                pinSpacing: true,
                                invalidateOnRefresh: true,
                                // Handle gallery fade out manually at the end of its pin
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
                        invalidateOnRefresh: true
                    });
                }
            });

        }, rootRef.current);

        return () => ctx.revert();
    }, [rootRef]);
};

export default useGSAPAnimations;
