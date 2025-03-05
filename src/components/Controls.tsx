import { useState } from "react";
import { PlayIcon, StopIcon } from "../assets/icons";

interface ControlsProps {
    isLoading: boolean;
    isTranslating: boolean;
    onToggleTranslation: () => void;
}

function Controls(props: ControlsProps) {
    const [targetLanguage, setTargetLanguage] = useState("");
    const [isChecked, setIsChecked] = useState(false);

    return (
        <div className="card bg-base-100 shadow-xl p-6 w-full md:w-90">
            <div className="space-y-6">
                {/* Start/Stop Translation Button */}
                <button 
                    className={`btn btn-block ${props.isTranslating ? 'btn-error' : 'btn-primary'}`}
                    disabled={props.isLoading}
                    onClick={props.onToggleTranslation}
                >
                    {props.isLoading ? (
                        <span className="loading loading-spinner"></span>
                    ) : props.isTranslating ? (
                        <>
                            <StopIcon className="mr-2 h-5 w-5"/>
                            Stop Translation
                        </>
                    ) : (
                        <>
                            <PlayIcon className="mr-2 h-5 w-5"/>
                            Start Translation
                        </>
                    )}
                </button>

                {/* Language Selection */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Target Language</span>
                    </label>
                    <select 
                        className="select select-bordered w-full"
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                    >
                        <option disabled value="">Select a language</option>
                        <option value="french">French</option>
                        <option value="spanish">Spanish</option>
                        <option value="arabic">Arabic</option>
                        <option value="chinese">Chinese</option>
                    </select>
                </div>

                {targetLanguage && (
                    <p className="text-sm text-base-content opacity-70">
                        Selected language: {targetLanguage}
                    </p>
                )}

                {/* Auto-punctuation Toggle */}
                <div className="form-control">
                    <label className="label cursor-pointer">
                        <span className="label-text">Auto-punctuation</span>
                        <input 
                            type="checkbox" 
                            className="toggle toggle-primary" 
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}

export default Controls;