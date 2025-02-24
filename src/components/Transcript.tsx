import {TextAreaField} from "@aws-amplify/ui-react";

interface TranscriptProps {
    transcript: string;
}

function Transcript(props: TranscriptProps) {
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
                value={props.transcript}
            />
        </div>
    );
}

export default Transcript;
