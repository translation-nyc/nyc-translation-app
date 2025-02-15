import {useState} from "react";
import {Button, TextAreaField} from "@aws-amplify/ui-react";
import {textToSpeech} from "../utils/text-to-speech.ts";

function Transcript() {
    const [transcription] = useState("This is where the transcription will be generated.");
    // Transcription set as aws sends it in
    // Text area field maybe not best to use for transcription?
    return (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <TextAreaField
                descriptiveText="This is where transcription will be generated"
                label="Transcription"
                labelHidden={true}
                placeholder="This is where transcription will be generated"
                rows={20}
                isReadOnly={true}
                variation="quiet"
                value={transcription}
            />
            <Button
                variation="primary"
                onClick={() => textToSpeech(transcription)}
            >
                Play Transcription
            </Button>
        </div>
    );
}

export default Transcript;
