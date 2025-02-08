import {useState} from "react";
import Controls from "./Controls.tsx";
import Transcript from "./Transcript.tsx";

function TranscriptionInterface() {
    const [isTranslating, setIsTranslating] = useState(false)

    const handleToggleTranslation = () => {
        setIsTranslating(!isTranslating)
    }

    return (
        <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
            <Controls
                isTranslating={isTranslating}
                onToggleTranslation={handleToggleTranslation}
            />
            <Transcript/>
        </div>
    );
}

export default TranscriptionInterface;
