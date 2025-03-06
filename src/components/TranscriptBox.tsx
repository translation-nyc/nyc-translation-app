import type {Transcript} from "../utils/types.ts";

export interface TranscriptProps {
    transcript: Transcript;
}

function TranscriptBox(props: TranscriptProps) {
    return (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-4 text-white">
            {props.transcript.parts.map((part, index) =>
                <div key={index} className="mb-4">
                    <p className="mb-0">
                        {part.text}
                    </p>
                    <p className="text-gray-400">
                        {part.translatedText}
                    </p>
                </div>
            )}
        </div>
    );
}

export default TranscriptBox;
