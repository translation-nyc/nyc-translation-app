import {ChangeEvent} from "react";
import {Moon, Sun, ZoomIn, ZoomOut} from "lucide-react";
import {useTheme} from "../hooks/useTheme";
import Help from "./Help.tsx";
import {ProfileIcon} from "../assets/icons";
import {signInWithRedirect} from "aws-amplify/auth";

function Toolbar() {
    const handleSignIn = async () => {
		try {
			await signInWithRedirect({
				provider: { custom: "MicrosoftEntraIDSAML" },
			});
		} catch (error) {
			console.error("Error signing in:", error);
		}
	};
    const {theme, cycleTheme, textSize, setTextSize} = useTheme();
    const handleTextSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(e.target.value);
        setTextSize(newSize);
    };

    return (
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
                        <input 
                            type="range" 
                            min={14}
                            max={36} 
                            step={4}
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
                <Help/>

                {/* Logout Button */}
                <button 
                    className="btn btn-primary" 
                    onClick={handleSignIn}
                >
                    <ProfileIcon className="mr-2 h-4 w-4" />
                    Log In
                </button>
            </div>
        </div>
    );
}

export default Toolbar;