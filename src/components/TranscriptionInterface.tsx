import {useRef, useState} from "react";
import type {TranscriptResultStream} from "@aws-sdk/client-transcribe-streaming";
import {SpeechTranscriber} from "../utils/SpeechTranscriber.ts";
import Controls from "./Controls.tsx";
import Transcript from "./Transcript.tsx";

function TranscriptionInterface() {
    const [isTranslating, setIsTranslating] = useState(false);

    const transcriberRef = useRef(new SpeechTranscriber(onTranscription));

    function onTranscription(event: TranscriptResultStream) {
        console.log(JSON.stringify(event));
    }

    async function toggleTranslation() {
        setIsTranslating(!isTranslating);
        const transcriber = transcriberRef.current;
        if (!isTranslating) {
            await transcriber.start();
        } else {
            await transcriber.stop();
        }
    }

    return (
        <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
            <Controls
                isTranslating={isTranslating}
                onToggleTranslation={toggleTranslation}
            />
            <Transcript/>
        </div>
    );
}

export default TranscriptionInterface;
