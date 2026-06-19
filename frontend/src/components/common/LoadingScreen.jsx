import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LoadingScreen = ({ 
    onFinished, 
    isLoading = false,
}) => {
    const [isInternalComplete, setIsInternalComplete] = useState(false);
    const [timerFinished, setTimerFinished] = useState(false);

    useEffect(() => {
        // Simple timer for the loading animation experience
        const timer = setTimeout(() => {
            setTimerFinished(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (timerFinished && !isLoading) {
            setIsInternalComplete(true);
            if (onFinished) onFinished();
        }
    }, [timerFinished, isLoading, onFinished]);

    return (
        <AnimatePresence>
            {(!isInternalComplete) && (
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
