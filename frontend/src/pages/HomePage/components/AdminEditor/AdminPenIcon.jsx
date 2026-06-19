import React from 'react';
import { Feather, Check } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useContent } from '../../../../context/ContentContext';
import GlobalEditorPanel from './GlobalEditorPanel';

const AdminPenIcon = () => {
    const { user } = useAuth();
    const { isEditMode, setIsEditMode, saveContent, content } = useContent();

    if (user?.role !== 'admin') return null;

    return (
        <div className="fixed top-[14%] right-[3.5%] z-[999] flex flex-row items-center gap-4">
            {isEditMode && (
                <button
                    onClick={() => saveContent(content)}
                    className="hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] hover:-translate-y-2"
                    title="Save Changes"
                >
                    <Check size={32} strokeWidth={1.5} className="text-[#10b981] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]" />
                </button>
            )}
            <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] hover:-translate-y-2 ${isEditMode ? 'animate-pulse opacity-80' : ''}`}
                title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
            >
                <Feather 
                    size={32} 
                    strokeWidth={1.5} 
                    className="text-black drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]" 
                />
            </button>
            <GlobalEditorPanel />
        </div>
    );
};

export default AdminPenIcon;
