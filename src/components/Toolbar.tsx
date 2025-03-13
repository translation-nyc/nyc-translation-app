import {ChangeEvent, useEffect, useState} from "react";
import {Moon, Sun, ZoomIn, ZoomOut, Contrast, Palette, Sparkles, Coffee, CircleUser} from "lucide-react";
import {useTheme} from "../hooks/useTheme";
import Help from "./Help.tsx";
import {ProfileIcon} from "../assets/icons";
import {signInWithRedirect, signOut,getCurrentUser} from "aws-amplify/auth";
import Alert from "./Alert";

// Define available themes with their icons
const themeOptions = [
    {name: "light", label: "Light", icon: <Sun className="w-4 h-4 text-yellow-500" />},
    {name: "dark", label: "Dark", icon: <Moon className="w-4 h-4 text-blue-200" />},
    {name: "cupcake", label: "Cupcake", icon: <Coffee className="w-4 h-4 text-pink-300" />},
    {name: "cyberpunk", label: "Cyberpunk", icon: <Sparkles className="w-4 h-4 text-purple-400" />},
    {name: "corporate", label: "Corporate", icon: <CircleUser className="w-4 h-4 text-blue-400" />},
    {name: "forest", label: "Forest", icon: <Contrast className="w-4 h-4 text-green-600" />},
    {name: "aqua", label: "Aqua", icon: <Palette className="w-4 h-4 text-cyan-500" />},
];

function Toolbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const {theme, setTheme, textSize, setTextSize} = useTheme();
    const [showSignInAlert, setShowSignInAlert] = useState(false);
    const [tempTextSize, setTempTextSize] = useState(textSize);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                
                if (code) {
                    await checkAuthStatus();
                }
            } catch (error) {
                console.error("Error handling redirect:", error);
            }
        };
        
        handleRedirect();
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
            setIsAuthenticated(false);
        }
    };

    const handleSignIn = async () => {
        try {
            await signInWithRedirect({
                provider: {custom: "MicrosoftEntraID"},
            });
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut({ global: true });
            setIsAuthenticated(false);

            localStorage.clear();
            sessionStorage.clear();
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

    // Handle theme selection
    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
    };

    return (
        <>
            <div className="navbar bg-base-100 shadow-md p-4">
                <div className="navbar-start">
                    <h1 className="normal-case text-3xl font-bold">
                        Conversate.
                    </h1>
                </div>

                <div className="navbar-end space-x-2">
                    {/* Text Size Slider */}
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost">
                            <ZoomOut className="w-5 h-5"/>
                            <div className="tooltip tooltip-primary tooltip-bottom" data-tip={`${isDragging ? tempTextSize : textSize}px`}>
                                <input
                                    type="range"
                                    min={10}
                                    max={24}
                                    step={1}
                                    value={isDragging ? tempTextSize : textSize}
                                    onChange={handleTextSizeChange}
                                    onMouseDown={() => setIsDragging(true)}
                                    onMouseUp={applyTextSize}
                                    onMouseLeave={isDragging ? applyTextSize : undefined}
                                    className="range range-xs range-primary w-32"
                                />
                            </div>
                            <ZoomIn className="w-5 h-5"/>
                        </div>
                    </div>

                    {/* Theme Dropdown */}
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle">
                            <Palette className="w-5 h-5"/>
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1"
                        >
                            {themeOptions.map((option) => (
                                <li key={option.name}>
                                    <a
                                        className={theme === option.name ? 'active font-bold' : ''}
                                        onClick={() => handleThemeChange(option.name)}
                                    >
                                        {option.icon}
                                        {option.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help Modal Button */}
                    <Help/>

                    {/* Log In or Sign Out Button */}
                    {isAuthenticated ? (
                        <button
                            className="btn btn-error"
                            onClick={handleSignOut}
                        >
                            <ProfileIcon className="mr-2 h-4 w-4"/>
                            Sign Out
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleSignIn}
                        >
                            <ProfileIcon className="mr-2 h-4 w-4"/>
                            Log In
                        </button>
                    )}
                </div>
            </div>

            {/* Success Alert */}
            <Alert
                message="Successfully signed in!"
                isVisible={showSignInAlert}
                onDismiss={() => setShowSignInAlert(false)}
                autoDismissTime={3000}
            />
        </>
    );
}

export default Toolbar;