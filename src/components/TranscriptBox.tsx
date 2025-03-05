import type {Transcript} from "../utils/types.ts";

export interface TranscriptProps {
    transcript: Transcript;
}

function TranscriptBox(props: TranscriptProps) {
    return (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-4 text-white">
            {props.transcript.parts.map((part, index) =>
                <p key={index} className="mb-4">
                    {part.text}
                </p>
            )}
        </div>
    );
}

export default TranscriptBox;
