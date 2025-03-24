import {JSX, useEffect, useState} from "react";
import {getCurrentUser, signInWithRedirect, signOut} from "aws-amplify/auth";
import {CircleUser, Coffee, Contrast, Menu, Monitor, Moon, Palette, Sparkles, Sun, ZoomIn, ZoomOut} from "lucide-react";
import {ThemeName, useTheme} from "../hooks/use-theme";
import {ProfileIcon} from "../assets/icons";
import Alert from "./Alert";
import Help from "./Help.tsx";

interface ThemeOption {
    name: ThemeName;
    label: string;
    icon: JSX.Element;
}

// Define available themes with their icons
const themeOptions: ThemeOption[] = [
    {
        name: "system",
        label: "System",
        icon: <Monitor className="w-4 h-4 text-gray-500"/>,
    },
    {
        name: "light",
        label: "Light",
        icon: <Sun className="w-4 h-4 text-yellow-500"/>,
    },
    {
        name: "dark",
        label: "Dark",
        icon: <Moon className="w-4 h-4 text-blue-200"/>,
    },
    {
        name: "cupcake",
        label: "Cupcake",
        icon: <Coffee className="w-4 h-4 text-pink-300"/>,
    },
    {
        name: "cyberpunk",
        label: "Cyberpunk",
        icon: <Sparkles className="w-4 h-4 text-purple-400"/>,
    },
    {
        name: "corporate",
        label: "Corporate",
        icon: <CircleUser className="w-4 h-4 text-blue-400"/>,
    },
    {
        name: "forest",
        label: "Forest",
        icon: <Contrast className="w-4 h-4 text-green-600"/>,
    },
    {
        name: "aqua",
        label: "Aqua",
        icon: <Palette className="w-4 h-4 text-cyan-500"/>,
    },
];

function Toolbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const {theme, setTheme, textSize, setTextSize} = useTheme();
    const [showSignInAlert, setShowSignInAlert] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    // Check screen size and set mobile view state
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileView(window.innerWidth < 640); // Use sm breakpoint (640px)
        };
        
        // Check on mount
        checkScreenSize();
        
        // Add resize listener
        window.addEventListener("resize", checkScreenSize);
        
        // Clean up
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get("code");
                
                if (code) {
                    await checkAuthStatus();
                }
            } catch (error) {
                console.error("Error handling redirect:", error);
            }
        };

        // noinspection JSIgnoredPromiseFromCall
        handleRedirect();
        // noinspection JSIgnoredPromiseFromCall
        checkAuthStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function checkAuthStatus() {
        try {
            const user = await getCurrentUser();
            const hasUser = !!user;

            if (hasUser
                && !isAuthenticated
                && localStorage.shownSignInAlert !== "true"
            ) {
                setShowSignInAlert(true);
                localStorage.shownSignInAlert = "true";
            }

            setIsAuthenticated(hasUser);
        } catch (error) {
            setIsAuthenticated(false);
        }
    }

    async function handleSignIn() {
        try {
            await signInWithRedirect({
                provider: {
                    custom: "MicrosoftEntraID",
                },
            });
        } catch (error) {
            console.error("Error signing in:", error);
        }
    }

    async function handleSignOut() {
        try {
            const savedTheme = localStorage.getItem("app-theme");
            const savedTextSize = localStorage.getItem("app-text-size");
            
            await signOut({
                global: true,
            });
            
            localStorage.clear();
            sessionStorage.clear();
            
            if (savedTheme) {
                localStorage.setItem("app-theme", savedTheme);
            }
            
            if (savedTextSize) {
                localStorage.setItem("app-text-size", savedTextSize);
            }
            
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    // Handle theme selection
    function handleThemeChange(newTheme: ThemeName) {
        setTheme(newTheme);
    }

    // Function to increase text size by clicking on the ZoomIn icon
    function increaseTextSize() {
        const newSize = Math.min(24, textSize + 1);
        setTextSize(newSize);
    }

    // Function to decrease text size by clicking on the ZoomOut icon
    function decreaseTextSize() {
        const newSize = Math.max(10, textSize - 1);
        setTextSize(newSize);
    }

    // Toggle mobile menu
    function toggleMobileMenu() {
        setMobileMenuOpen(!mobileMenuOpen);
    }

    // Desktop toolbar component
    function DesktopToolbar() {
        return (
            <div className="navbar-end flex space-x-2">
                {/* Text Size Controls with Tooltip */}
                <div className="dropdown dropdown-end flex items-center">
                    <div className="tooltip tooltip-primary tooltip-bottom" data-tip={`Text Size`}>
                        <div className="flex items-center gap-2 btn btn-ghost">
                            <button
                                className="btn btn-ghost btn-sm p-1"
                                onClick={decreaseTextSize}
                            >
                                <ZoomOut className="w-5 h-5"/>
                            </button>

                            <span className="text-sm">{textSize}px</span>

                            <button
                                className="btn btn-ghost btn-sm p-1"
                                onClick={increaseTextSize}
                            >
                                <ZoomIn className="w-5 h-5"/>
                            </button>
                        </div>
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
                                    className={theme === option.name ? "active font-bold" : ""}
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
        );
    }

    // Mobile toolbar component
    function MobileToolbarButton() {
        return (
            <div className="navbar-end">
                <button className="btn btn-ghost" onClick={toggleMobileMenu}>
                    <Menu className="w-6 h-6"/>
                </button>
            </div>
        );
    }

    // Mobile menu component with buttons for text size
    function MobileMenu() {
        return (
            <div className="bg-base-100 shadow-md p-4 flex flex-col gap-4">
                {/* Text Size Controls for Mobile */}
                <div className="flex items-center justify-between">
                    <span>
                        Text Size
                    </span>
                    <div className="flex items-center">
                        <button className="btn btn-ghost btn-sm" onClick={decreaseTextSize}>
                            <ZoomOut className="w-4 h-4"/>
                        </button>
                        <span className="mx-2">
                            {textSize}px
                        </span>
                        <button className="btn btn-ghost btn-sm" onClick={increaseTextSize}>
                            <ZoomIn className="w-4 h-4"/>
                        </button>
                    </div>
                </div>

                {/* Theme Selection for Mobile */}
                <div className="flex flex-col gap-2">
                    <span>
                        Theme
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                        {themeOptions.map((option) => (
                            <button
                                key={option.name}
                                className={`btn btn-sm ${theme === option.name ? "btn-primary" : "btn-ghost"}`}
                                onClick={() => handleThemeChange(option.name)}
                            >
                                {option.icon}
                                <span className="text-xs">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Help Button for Mobile */}
                <div className="flex justify-center">
                    <Help/>
                </div>

                {/* Auth Button for Mobile */}
                <div className="flex justify-center">
                    {isAuthenticated ? (
                        <button
                            className="btn btn-error w-full"
                            onClick={handleSignOut}
                        >
                            <ProfileIcon className="mr-2 h-4 w-4"/>
                            Sign Out
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary w-full"
                            onClick={handleSignIn}
                        >
                            <ProfileIcon className="mr-2 h-4 w-4"/>
                            Log In
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="navbar bg-base-100 shadow-md p-4">
                <div className="navbar-start">
                    <h1 className="normal-case text-3xl font-bold">
                        Conversate.
                    </h1>
                </div>

                {/* Render either mobile or desktop toolbar based on screen size */}
                {isMobileView ? <MobileToolbarButton/> : <DesktopToolbar/>}
            </div>

            {/* Mobile menu dropdown - only appears when mobileMenuOpen is true AND in mobile view */}
            {mobileMenuOpen && isMobileView && <MobileMenu/>}

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
