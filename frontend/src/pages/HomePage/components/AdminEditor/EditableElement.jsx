import React, { useRef, useEffect } from 'react';
import { useContent } from '../../../../context/ContentContext';

const EditableElement = ({ section, fieldKey, index, children, className, style, as: Component = 'div', ...props }) => {
    const { isEditMode, content, setContent, activeElement, setActiveElement } = useContent();
    const elementRef = useRef(null);

    // Resolve current data
    let currentData = {};
    if (index !== undefined) {
        currentData = content[section]?.[fieldKey]?.[index] || {};
    } else {
        currentData = content[section]?.[fieldKey] || {};
    }

    const isActive = activeElement?.section === section && activeElement?.fieldKey === fieldKey && activeElement?.index === index;

    const handleSelect = (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        setActiveElement({ section, fieldKey, index });
    };

    const handleInput = (e) => {
        if (!isEditMode) return;
        const newText = e.currentTarget.textContent;
        
        setContent(prev => {
            const newContent = { ...prev };
            if (!newContent[section]) newContent[section] = {};
            
            if (index !== undefined) {
                if (!Array.isArray(newContent[section][fieldKey])) {
                    newContent[section][fieldKey] = [];
                }
                const newArray = [...newContent[section][fieldKey]];
                newArray[index] = { ...newArray[index], text: newText };
                newContent[section][fieldKey] = newArray;
            } else {
                newContent[section][fieldKey] = {
                    ...newContent[section][fieldKey],
                    text: newText
                };
            }
            return newContent;
        });
    };

    // Ensure text syncs if changed externally, but don't overwrite while typing
    useEffect(() => {
        if (elementRef.current && currentData.text !== undefined && elementRef.current.textContent !== currentData.text) {
            // Only update if not actively focused to prevent cursor jumping
            if (document.activeElement !== elementRef.current) {
                elementRef.current.textContent = currentData.text;
            }
        }
    }, [currentData.text]);

    return (
        <Component 
            ref={elementRef}
            onClick={handleSelect}
            onInput={handleInput}
            contentEditable={isEditMode}
            suppressContentEditableWarning={true}
            className={`transition-all duration-200 outline-none ${className || ''} ${isEditMode ? 'hover:outline-dashed hover:outline-2 hover:outline-blue-400 cursor-text pointer-events-auto relative z-50' : ''} ${isActive && isEditMode ? 'outline-dashed outline-2 outline-blue-600 bg-blue-500/10' : ''}`} 
            style={{ 
                ...style, 
                ...(currentData.color ? { color: currentData.color } : {}),
                ...(currentData.fontSize ? { fontSize: currentData.fontSize } : {}),
                ...(currentData.fontFamily ? { fontFamily: currentData.fontFamily } : {})
            }}
            {...props}
        >
            {currentData.text !== undefined ? currentData.text : children}
        </Component>
    );
};

export default EditableElement;
