interface TranscriptProps {
    transcript: string;
}

function Transcript(props: TranscriptProps) {
    // Transcription set as aws sends it in
    // Text area field maybe not best to use for transcription?
    return (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-4 text-white">
            {props.transcript}
        </div>
    );
}

export default Transcript;