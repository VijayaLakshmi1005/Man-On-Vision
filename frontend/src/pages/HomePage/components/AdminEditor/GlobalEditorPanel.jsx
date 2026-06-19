import React from 'react';
import { useContent } from '../../../../context/ContentContext';

const GlobalEditorPanel = () => {
    const { isEditMode, content, setContent, activeElement, setActiveElement } = useContent();

    if (!isEditMode || !activeElement) return null;

    const { section, fieldKey, index } = activeElement;

    // Resolve current data
    let currentData = {};
    if (index !== undefined) {
        currentData = content[section]?.[fieldKey]?.[index] || {};
    } else {
        currentData = content[section]?.[fieldKey] || {};
    }

    const handleChange = (field, value) => {
        setContent(prev => {
            const newContent = { ...prev };
            if (!newContent[section]) newContent[section] = {};
            
            if (index !== undefined) {
                if (!Array.isArray(newContent[section][fieldKey])) {
                    newContent[section][fieldKey] = [];
                }
                const newArray = [...newContent[section][fieldKey]];
                newArray[index] = { ...newArray[index], [field]: value };
                newContent[section][fieldKey] = newArray;
            } else {
                newContent[section][fieldKey] = {
                    ...newContent[section][fieldKey],
                    [field]: value
                };
            }
            return newContent;
        });
    };

    const fontFamilies = [
        { label: 'Default', value: '' },
        { label: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
        { label: 'Inter', value: "'Inter', sans-serif" },
        { label: 'Serif', value: "serif" },
        { label: 'Monospace', value: "monospace" }
    ];

    return (
        <div className="fixed top-[22%] right-[3.5%] z-[1000] w-64 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200 p-4 flex flex-col gap-4 text-black">
            <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-gray-500">Style Editor</span>
                <button onClick={() => setActiveElement(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Color</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="color" 
                        value={currentData.color || '#000000'} 
                        onChange={(e) => handleChange('color', e.target.value)}
                        className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent"
                    />
                    <input 
                        type="text" 
                        value={currentData.color || ''}
                        onChange={(e) => handleChange('color', e.target.value)}
                        className="flex-1 text-sm p-1.5 border rounded bg-gray-50 uppercase"
                        placeholder="#Hex"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Font Size</label>
                <input 
                    type="text" 
                    value={currentData.fontSize || ''} 
                    onChange={(e) => handleChange('fontSize', e.target.value)}
                    className="text-sm p-1.5 border rounded bg-gray-50"
                    placeholder="e.g. 7.5vw or 40px"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Font Family</label>
                <select 
                    value={currentData.fontFamily || ''}
                    onChange={(e) => handleChange('fontFamily', e.target.value)}
                    className="text-sm p-1.5 border rounded bg-gray-50"
                >
                    {fontFamilies.map(font => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default GlobalEditorPanel;
