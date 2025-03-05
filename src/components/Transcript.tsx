import { useState } from "react";
import { textToSpeech } from "../utils/text-to-speech.ts";

function Transcript() {
    const [transcription] = useState("This is where the transcription will be generated.");

    return (
        <div className="card bg-base-100 shadow-xl h-full w-full flex flex-col">
            <div className="card-body flex-grow">
                <textarea 
                    className="textarea textarea-bordered h-full w-full resize-none" 
                    placeholder="Transcription will be generated here"
                    value={transcription}
                    readOnly
                />
                <div className="card-actions justify-end">
                    <button 
                        className="btn btn-primary" 
                        onClick={() => textToSpeech(transcription)}
                    >
                        Play Transcription
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Transcript;