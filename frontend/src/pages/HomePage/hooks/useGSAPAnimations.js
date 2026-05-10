import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ 
    ignoreMobileResize: true, // Prevents jumps when mobile address bar hides/shows
    limitCallbacks: true 
});

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
                        end: isMobile ? "+=150%" : "+=250%", // Increased back for impact
                        scrub: isMobile ? 0.5 : 1,            // Balanced smoothing
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
                                window.heroTwirl = self.progress * (isMobile ? 15 : 15);
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
                        { scale: 1, autoAlpha: 1 },
                        {
                            // 4x is perfectly safe for mobile memory limits while still filling the screen
                            scale: isMobile ? 4 : 15,
                            ease: "power2.inOut",
                            duration: 3,
                            force3D: !isMobile,
                            overwrite: "auto"
                        }
                    )
                        .to("#hero-logo-container", {
                            autoAlpha: 0,
                            duration: 1,
                            ease: "power1.inOut",
                        }, "-=1.5");
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
                        { opacity: 0, y: isMobile ? 30 : 50, scale: 0.95, pointerEvents: "none" },
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
                // Skip about (no animation)
                if (section.id === 'about') return;

                // Ensure gallery stays on top of following sections while pinning
                const isGallery = section.id === 'gallery';
                gsap.set(section, {
                    zIndex: isGallery ? 50 : index + 10,
                    position: 'relative',
                    backgroundColor: 'transparent'
                });

                // --- SECTION FADE SCRUB ---
                const isLastSection = index === sections.length - 1;

                gsap.set(section, { opacity: 1 });

                if (!isLastSection && !isGallery) {
                    gsap.fromTo(section,
                        { opacity: 1 },
                        {
                            opacity: 0,
                            ease: "power1.in",
                            scrollTrigger: {
                                trigger: section,
                                start: isMobile ? "bottom 40%" : "bottom 20%",
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
                        { opacity: 0, y: isMobile ? 20 : 30, scale: 0.98 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            stagger: 0.1,
                            duration: 0.8,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: section,
                                start: isMobile ? "top 90%" : "top 85%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                }

                // --- PINNING LOGIC ---
                // Standard section pinning for all sections
                const pinEnd = section.id === 'gallery' ? "+=400%" : (isMobile ? "+=80%" : "+=100%");
                
                ScrollTrigger.create({
                    trigger: section,
                    start: "top top",
                    end: pinEnd, 
                    pin: true,
                    pinSpacing: true,
                    scrub: true,
                    invalidateOnRefresh: true,
                    fastScrollEnd: true,
                    preventOverlaps: true
                });
            });

        }, rootRef.current);

        return () => ctx.revert();
    }, [rootRef]);
};

export default useGSAPAnimations;
