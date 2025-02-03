import {useState} from "react";
import Toolbar from "./components/Toolbar";
import Controls from "./components/Controls";
import Transcript from "./components/Transcript";

function App() {
    const [isTranslating, setIsTranslating] = useState(false)

    const handleToggleTranslation = () => {
        setIsTranslating(!isTranslating)
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <Toolbar />
            <main className="flex-1 flex flex-col md:flex-row p-4 gap-4">
                <Controls isTranslating={isTranslating} onToggleTranslation={handleToggleTranslation} />
                <Transcript />
            </main>
        </div>
    );
}

export default App;
