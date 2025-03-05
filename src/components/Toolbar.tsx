import { Button } from "@aws-amplify/ui-react";
import { ProfileIcon } from "../assets/icons";
import { Moon, Sun, HelpCircle, ZoomIn, ZoomOut } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useAuthenticator } from "@aws-amplify/ui-react";

function Toolbar() {
    const { signOut } = useAuthenticator();
    const { theme, cycleTheme, textSize, setTextSize } = useTheme();   
    const handleTextSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(e.target.value);
        setTextSize(newSize);
    };
    
    return (
        <div className="navbar bg-base-100 shadow-md">
            <div className="navbar-start">
                <h1 className="btn btn-ghost normal-case text-3xl font-bold">
                    Conversate.
                </h1>
            </div>
            
            <div className="navbar-end space-x-2">
                {/* Text Size Slider */}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost">
                        <ZoomOut className="w-5 h-5" />
                        <input 
                            type="range" 
                            min={8}
                            max={24} 
                            step={2}
                            value={textSize} 
                            onChange={handleTextSizeChange}
                            className="range range-xs range-primary w-32" 
                        />
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
                <button 
                    className="btn btn-ghost btn-circle" 
                    onClick={() => document.getElementById('help_modal')?.showModal()}
                >
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                </button>

                {/* Help Modal */}
                <dialog id="help_modal" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Help</h3>
                        <p className="py-4">Press ESC key or click ✕ to close</p>
                    </div>
                </dialog>

                {/* Logout Button */}
                <button 
                    className="btn btn-primary" 
                    onClick={signOut}
                >
                    <ProfileIcon className="mr-2 h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Toolbar;