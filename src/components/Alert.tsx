import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AlertProps {
    message: string;
    isVisible: boolean;
    onDismiss: () => void;
    autoDismissTime?: number; 
}

const Alert: React.FC<AlertProps> = ({ 
    message, 
    isVisible, 
    onDismiss, 
    autoDismissTime = 30000
}) => {
    useEffect(() => {
        let dismissTimer: NodeJS.Timeout;
        
        if (isVisible && autoDismissTime > 0) {
            dismissTimer = setTimeout(() => {
                onDismiss();
            }, autoDismissTime);
        }
        
        return () => {
            if (dismissTimer) {
                clearTimeout(dismissTimer);
            }
        };
    }, [isVisible, onDismiss, autoDismissTime]);

    if (!isVisible) return null;

    return (
        <div className="toast toast-bottom toast-start z-50">
            <div role="alert" className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{message}</span>
                <button onClick={onDismiss} className="btn btn-sm btn-circle ml-auto">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Alert;