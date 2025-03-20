import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

// Create a context to manage popup state globally
interface PopupContextType {
    showPopup: (content: React.ReactNode, x: number, y: number) => void;
    hidePopup: () => void;
}

const PopupContext = createContext<PopupContextType | null>(null);

// Provider component to wrap your application
export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [popupState, setPopupState] = useState<{
        isVisible: boolean;
        content: React.ReactNode;
        position: { x: number, y: number };
    }>({
        isVisible: false,
        content: null,
        position: { x: 0, y: 0 },
    });

    const popupRef = useRef<HTMLDivElement>(null);

    const showPopup = (content: React.ReactNode, x: number, y: number) => {
        setPopupState({
            isVisible: true,
            content,
            position: { x, y },
        });
    };

    const hidePopup = () => {
        setPopupState(prev => ({ ...prev, isVisible: false }));
    };

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                hidePopup();
            }
        };

        if (popupState.isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popupState.isVisible]);

    return (
        <PopupContext.Provider value={{ showPopup, hidePopup }}>
            {children}
            {popupState.isVisible && (
                <div
                    ref={popupRef}
                    className="fixed bg-white border border-gray-200 rounded shadow-md p-4 z-50"
                    style={{
                        left: `${popupState.position.x}px`,
                        top: `${popupState.position.y}px`,
                        transform: 'translate(-50%, -100%)',
                        marginTop: '-10px'
                    }}
                >
                    {popupState.content}
                </div>
            )}
        </PopupContext.Provider>
    );
};

// Custom hook to use the popup functionality
export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider');
    }
    return context;
};

// Component that can trigger the popup
export const PopupTrigger: React.FC<{
    content: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}> = ({ content, children, className = '' }) => {
    const { showPopup } = usePopup();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        showPopup(content, e.clientX, e.clientY);
    };

    return (
        <div className={className} onClick={handleClick}>
            {children}
        </div>
    );
};