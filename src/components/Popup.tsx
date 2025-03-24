import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";

// Create a context to manage popup state globally
interface PopupContextType {
    showPopup: (x: number, y: number, content: React.ReactNode) => void;
    hidePopup: () => void;
}

const PopupContext = createContext<PopupContextType | null>(null);

export interface PopupProviderProps {
    children: ReactNode;
}

interface PopupState {
    isVisible: boolean;
    content: ReactNode;
    position: {
        x: number,
        y: number,
    };
}

// Provider component to wrap your application
export function PopupProvider(props: PopupProviderProps) {
    const [popupState, setPopupState] = useState<PopupState>({
        isVisible: false,
        content: null,
        position: {
            x: 0,
            y: 0,
        },
    });

    const popupRef = useRef<HTMLDivElement>(null);

    function showPopup(x: number, y: number, content: ReactNode) {
        setPopupState({
            isVisible: true,
            content,
            position: {
                x,
                y,
            },
        });
    }

    function hidePopup() {
        setPopupState(prev => ({...prev, isVisible: false}));
    }

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                hidePopup();
            }
        };

        if (popupState.isVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popupState.isVisible]);

    // noinspection JSUnusedGlobalSymbols
    return (
        <PopupContext.Provider value={{showPopup, hidePopup}}>
            {props.children}
            {popupState.isVisible && (
                <div
                    ref={popupRef}
                    className="fixed border bg-accent border-gray-400 rounded shadow-md p-4 z-50 card"
                    style={{
                        left: `${popupState.position.x}px`,
                        top: `${popupState.position.y}px`,
                        transform: "translate(-50%, -100%)",
                        marginTop: "-10px"
                    }}
                >
                    {popupState.content}
                </div>
            )}
        </PopupContext.Provider>
    );
}

// Custom hook to use the popup functionality
// eslint-disable-next-line react-refresh/only-export-components
export function usePopup() {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("usePopup must be used within a PopupProvider");
    }
    return context;
}
