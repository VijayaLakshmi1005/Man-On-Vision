import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LoadingScreen = ({ 
    onFinished, 
    isLoading = true,
}) => {
    const [isInternalComplete, setIsInternalComplete] = useState(false);

    useEffect(() => {
        if (!isLoading) return;

        // Simple timer for the loading animation experience
        const timer = setTimeout(() => {
            setIsInternalComplete(true);
            if (onFinished) onFinished();
        }, 2500);

        return () => clearTimeout(timer);
    }, [onFinished, isLoading]);

    return (
        <AnimatePresence>
            {(isLoading && !isInternalComplete) && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FDFBF7]"
                >
                    <div className="relative w-full max-w-[300px] aspect-square flex flex-col items-center justify-center">
                        <DotLottieReact
                            src="https://lottie.host/d5811e43-d4d2-4d65-aba8-8e60017c5710/0Ggj8jbXne.lottie"
                            loop
                            autoplay
                            className="w-full h-full"
                        />
                        <p className="text-stone-400 text-[10px] uppercase tracking-[0.4em] font-bold mt-4">
                            Loading... Please wait
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
