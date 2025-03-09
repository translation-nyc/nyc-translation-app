import type {VoiceId} from "@aws-sdk/client-polly";
import {HiMiniSpeakerWave} from "react-icons/hi2";
import type {Transcript, TtsVoice} from "../utils/types.ts";
import {Languages} from "../utils/languages.ts";
import {textToSpeech} from "../utils/text-to-speech.ts";

export interface TranscriptProps {
    transcript: Transcript;
    selectedVoices: Record<string, TtsVoice>;
}

function TranscriptBox(props: TranscriptProps) {
    return (
        <div className="flex-1 bg-base-100 rounded-lg shadow-lg overflow-hidden p-4">
            {props.transcript.parts.map((part, index) => {
                let showPlayIconFirst: boolean;
                let showPlayIconSecond: boolean;
                if (part.language === Languages.ENGLISH) {
                    showPlayIconFirst = false;
                    showPlayIconSecond = true;
                } else {
                    showPlayIconFirst = true;
                    showPlayIconSecond = false;
                }
                return (
                    <div key={index} className="mb-4">
                        <div className="flex flex-row">
                            <PlayTtsButton
                                text={part.text}
                                voice={props.selectedVoices[part.language.name].id}
                                visible={showPlayIconFirst}
                            />
                            <p className="mb-0">
                                {part.text}
                            </p>
                        </div>
                        <div className="flex flex-row">
                            <PlayTtsButton
                                text={part.translatedText}
                                voice={props.selectedVoices[part.translatedLanguage.name].id}
                                visible={showPlayIconSecond}
                            />
                            <p className="text-gray-400">
                                {part.translatedText}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface PlayTtsButtonProps {
    text: string;
    voice: VoiceId;
    visible: boolean;
}

function PlayTtsButton(props: PlayTtsButtonProps) {
    async function playTts() {
        await textToSpeech(props.text, props.voice);
    }

    return (
        <HiMiniSpeakerWave
            className={`mr-2 transition duration-200 hover:text-gray-500 cursor-pointer ${props.visible ? "" : "invisible"}`}
            onClick={playTts}
        />
    );
}

export default TranscriptBox;
