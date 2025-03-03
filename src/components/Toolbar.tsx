import { Button, ButtonGroup, useAuthenticator, SliderField} from "@aws-amplify/ui-react";
import { ProfileIcon } from "../assets/icons";
import { Moon, Sun, HelpCircle, ZoomIn, ZoomOut } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import "../styles/Toolbar.css";

function Toolbar() {
    const { signOut } = useAuthenticator();
    const { theme, cycleTheme, textSize, setTextSize } = useTheme();   
    const handleTextSizeChange = (value: number) => {
        setTextSize(value);
    };
    
    return (
        <header className="navbar flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
                <h1 className="name text-3xl font-bold text-gray-800">
                    Conversate.
                </h1>
            </div>

            <div className="flex items-center space-x-2">
                {/* Text Size Slider */}
                <div className="flex items-center space-x-2 ml-4">
                    <SliderField
                        label="Text size"
                        labelHidden
                        outerStartComponent={
                            <ZoomOut className="text-gray-600 dark:text-gray-400" />
                        }
                        outerEndComponent={
                            <ZoomIn className="text-gray-600 dark:text-gray-400" />
                        }
                        min={8}
                        max={24}
                        step={2}
                        value={textSize}               // Changed from defaultValue to value
                        onChange={handleTextSizeChange} // Added onChange handler
                    />
                </div>
                
                <ButtonGroup size="small">
                    {/* Dark mode toggle button */}
                    <Button onClick={cycleTheme} className="dark-mode p-2">
                        {theme === "light" && <Sun className="w-5 h-5 text-yellow-500" />}
                        {theme === "dark" && <Moon className="w-5 h-5 text-black-200" />}
                    </Button>
                    
                    {/* Help Button */}
                    <Button className="p-2">
                        <HelpCircle className="w-5 h-5 text-blue-500" />
                    </Button>
                    
                    {/* Logout button */}
                    <Button className="logout-button" size="small" onClick={signOut}>
                        <ProfileIcon className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </ButtonGroup>
            </div>

        </header>
    );
}

export default Toolbar;
