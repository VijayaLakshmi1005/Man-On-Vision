import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ContentContext = createContext();

const defaultContent = {
    heroSection: {
        smallHeader: { text: "Media Production Company", color: "#151515", fontSize: "0.7vw" },
        titleBlocks: [
            { id: 1, text: "MAN", color: "#151515" },
            { id: 2, text: "ON", color: "#151515" },
            { id: 3, text: "VISION", color: "#F53171" }
        ],
        tagline: { 
            line1A: { text: "VISION", color: "#F53171" }, 
            line1B: { text: "FUELS STORIES.", color: "#151515" }, 
            line2: { text: "WE BRING THEM TO LIFE.", color: "#151515" } 
        },
        cta: { text: "EXPLORE OUR WORK", color: "#F53171" }
    },
    nextSection: {
        titleBlocks: [
            { id: 1, text: "VISION", color: "#151515" },
            { id: 2, text: "HAS NO", color: "#151515" },
            { id: 3, text: "LIMITS.", color: "#F53171" }
        ],
        tagline: {
            line1: { text: "We don't follow limits,", color: "#151515" },
            line2: { text: "we transform them into", color: "#151515" },
            line3: { text: "new possibilities.", color: "#151515" }
        },
        cta: { text: "OUR STORY", color: "#F53171" },
        sideText: { text: "STORIES LIVE FOREVER", color: "#151515" }
    },
    workProfileSection: {
        subtitle: { text: "SELECTED WORKS" },
        titleLine1: { text: "VISIONS" },
        titleLine2: { text: "MADE REAL" },
        description: { text: "We sculpt raw imagination, \ntranslating bold visions into \ncinematic realities." },
        ctaText: { text: "OUR WORKS" }
    },
    fourthSection: {
        titlePrefix: { text: "OUR" },
        titleSuffix: { text: "SERVICES" },
        description: { text: "From conceptualization to the final cinematic cut, we craft tailored visual experiences that transcend boundaries and bring your boldest ideas to life." },
        ctaText: { text: "SHARE YOUR VISION" },
        services: [
            { title: "CINEMATOGRAPHY" },
            { title: "POST-PRODUCTION" },
            { title: "CREATIVE DIR." },
            { title: "CONCEPTUALIZATION" }
        ]
    },
    contactSection: {
        spinningBadge: { text: "• PREMIUM CINEMATOGRAPHY • EST. 2026" },
        tape1Text: { text: "LET'S CREATE A MASTERPIECE ●" },
        tape2Text: { text: "YOUR VISION, OUR LENS ●" },
        titleLine1: { text: "LET'S" },
        titleLine2: { text: "CREATE" },
        email: { text: "HELLO@MANONVISION.COM" },
        social1: { text: "INSTAGRAM" },
        social2: { text: "LINKEDIN" },
        social3: { text: "YOUTUBE" }
    }
};

export const ContentProvider = ({ children }) => {
    const [content, setContent] = useState(defaultContent);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeElement, setActiveElement] = useState(null);
    const { token } = useAuth();
    
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/content/homepage`);
                if (res.data && Object.keys(res.data).length > 0) {
                    setContent(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch homepage content', err);
            }
        };
        fetchContent();
    }, []);

    const saveContent = async (newContent) => {
        try {
            setContent(newContent);
            await axios.put(`${import.meta.env.VITE_API_URL}/api/content/homepage`, newContent, {
                headers: { 'x-auth-token': token }
            });
            toast.success("Changes saved successfully!");
        } catch (err) {
            console.error('Failed to save homepage content', err);
            toast.error("Failed to save changes.");
        }
    };

    return (
        <ContentContext.Provider value={{ content, setContent, saveContent, isEditMode, setIsEditMode, activeElement, setActiveElement }}>
            {children}
        </ContentContext.Provider>
    );
};

export const useContent = () => useContext(ContentContext);
