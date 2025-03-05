import {Transcript} from "../utils/types.ts";

export interface TranscriptProps {
    transcript: Transcript;
}

function TranscriptBox(props: TranscriptProps) {
    return (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-4 text-white">
            {props.transcript.parts.map((part, index) => {
                if (index === 0) {
                    return (
                        <div key={index}>
                            {part.text}
                        </div>
                    );
                } else {
                    return (
                        <div key={index}>
                            <br/>
                            {part.text}
                        </div>
                    );
                }
            })}
        </div>
    );
}

export default TranscriptBox;
