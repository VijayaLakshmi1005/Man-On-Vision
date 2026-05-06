import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useGSAPAnimations = (rootRef) => {
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            window.heroTwirl = 0;

            const isMobile = window.innerWidth < 768;

            // 1. CINEMATIC OVERLAY TRANSITION (THE FLOW)
            if (document.querySelector("#intro-container")) {
                const introTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: "#intro-container",
                        start: "top top",
                        end: isMobile ? "+=100%" : "+=250%", // Aggressively shorter for mobile
                        scrub: isMobile ? true : 1,          // Zero delay on mobile for snappiness
                        pin: true,
                        pinSpacing: true,
                        anticipatePin: 1,
                        fastScrollEnd: true,
                        preventOverlaps: true,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            if (self.progress === 0) {
                                window.heroTwirl = 0;
                            } else {
                                window.heroTwirl = self.progress * (isMobile ? 8 : 15);
                            }
                        },
                        onToggle: (self) => {
                            if (!self.isActive && self.progress === 0) {
                                window.heroTwirl = 0;
                            }
                        }
                    }
                });

                if (document.querySelector("#hero-logo-container")) {
                    introTl.fromTo("#hero-logo-container", 
                        { scale: 1, opacity: 1 },
                        {
                            scale: isMobile ? 5 : 15,    // Further reduced for mobile performance
                            ease: "power2.inOut", 
                            duration: 3,
                            force3D: !isMobile,
                            overwrite: "auto"
                        }
                    )
                    .to("#hero-logo-container", {
                        opacity: 0,
                        duration: 0.8,
                        ease: "power1.inOut",
                    }, "-=1.8"); // Fade out much earlier
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
                        { opacity: 0, y: isMobile ? 20 : 50, scale: 0.98, pointerEvents: "none" },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            pointerEvents: "auto",
                            duration: 1.2,
                            ease: "power3.out",
                            force3D: true
                        }, 
                        "-=1.5"
                    );
                }
            }

            // 2. STORYTELLING SECTIONS - STACKED SYSTEM
            const sections = gsap.utils.toArray('.scroll-section');
            
            sections.forEach((section, index) => {
                if (section.id === 'about') return;

                gsap.set(section, { 
                    zIndex: index + 10,
                    position: 'relative' 
                });

                // --- SECTION FADE SCRUB ---
                const isLastSection = index === sections.length - 1;
                const isGallery = section.id === 'gallery';

                gsap.set(section, { opacity: 1 });

                if (!isLastSection && !isGallery) {
                    gsap.fromTo(section, 
                        { opacity: 1 },
                        {
                            opacity: 0,
                            ease: "power1.in",
                            scrollTrigger: {
                                trigger: section,
                                start: isMobile ? "bottom 60%" : "bottom 20%", 
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
                        { opacity: 0, y: isMobile ? 15 : 30, scale: 0.99 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            stagger: 0.1,
                            duration: 0.8,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: section,
                                start: isMobile ? "top 95%" : "top 85%",
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
                                end: () => isMobile ? `+=${content.scrollWidth * 1.1}` : `+=${content.scrollWidth * 1.5}`,
                                scrub: isMobile ? true : 1,
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
                        end: isMobile ? "+=40%" : "+=100%", // Very short pin on mobile for speed
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
