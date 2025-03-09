import {ChangeEvent, useEffect, useState} from "react";
import {Moon, Sun, ZoomIn, ZoomOut} from "lucide-react";
import {useTheme} from "../hooks/useTheme";
import Help from "./Help.tsx";
import {ProfileIcon} from "../assets/icons";
import {signInWithRedirect, signOut, getCurrentUser} from "aws-amplify/auth";
import Alert from "./Alert";

function Toolbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const {theme, cycleTheme, textSize, setTextSize} = useTheme();
    const [showSignInAlert, setShowSignInAlert] = useState(false);
    // Add local state to track slider value during movement
    const [tempTextSize, setTempTextSize] = useState(textSize);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Keep tempTextSize in sync with textSize when not dragging
    useEffect(() => {
        if (!isDragging) {
            setTempTextSize(textSize);
        }
    }, [textSize, isDragging]);

    const checkAuthStatus = async () => {
        try {
            const user = await getCurrentUser();
            const hasUser = !!user;

            if (hasUser && !isAuthenticated && document.readyState === 'complete') {
                setShowSignInAlert(true);
            }
            
            setIsAuthenticated(hasUser);
        } catch (error) {
            console.log('Not authenticated');
            setIsAuthenticated(false);
        }
    };

    const handleSignIn = async () => {
        try {
            await signInWithRedirect({
                provider: { custom: "MicrosoftEntraIDSAML" },
            });
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Update only the temporary size during drag
    const handleTextSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(e.target.value);
        setTempTextSize(newSize);
    };

    // Apply the text size only when slider is released
    const applyTextSize = () => {
        setTextSize(tempTextSize);
        setIsDragging(false);
    };

    return (
        <>
            <div className="navbar bg-base-100 shadow-md">
                <div className="navbar-start">
                    <h1 className="normal-case text-3xl font-bold">
                        Conversate.
                    </h1>
                </div>

                <div className="navbar-end space-x-2">
                    {/* Text Size Slider */}
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost">
                            <ZoomOut className="w-5 h-5" />
                            <div className="tooltip tooltip-primary tooltip-bottom" data-tip={`${isDragging ? tempTextSize : textSize}px`}>
                                <input 
                                    type="range" 
                                    min={6}
                                    max={26} 
                                    step={1}
                                    value={isDragging ? tempTextSize : textSize}
                                    onChange={handleTextSizeChange}
                                    onMouseDown={() => setIsDragging(true)}
                                    onMouseUp={applyTextSize}
                                    onMouseLeave={isDragging ? applyTextSize : undefined}
                                    className="range range-xs range-primary w-32" 
                                />
                            </div>
                            <ZoomIn className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <button 
                        className="btn btn-ghost btn-circle" 
                        onClick={cycleTheme}
                    >
                        {theme === "light" ? (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <Moon className="w-5 h-5 text-blue-200" />
                        )}
                    </button>

                    {/* Help Modal Button */}
                    <Help/>

                    {/* Log In or Sign Out Button */}
                    {isAuthenticated ? (
                        <button 
                            className="btn btn-error" 
                            onClick={handleSignOut}
                        >
                            <ProfileIcon className="mr-2 h-4 w-4" />
                            Sign Out
                        </button>
                    ) : (
                        <button 
                            className="btn btn-primary" 
                            onClick={handleSignIn}
                        >
                            <ProfileIcon className="mr-2 h-4 w-4" />
                            Log In
                        </button>
                    )}
                </div>
            </div>
            
            {/* Alerts */}
            <Alert 
                message="Successfully signed in!" 
                isVisible={showSignInAlert} 
                onDismiss={() => setShowSignInAlert(false)} 
            />
            
        </>
    );
}

export default Toolbar;