import {useState} from "react";
import type {VoiceId} from "@aws-sdk/client-polly";
import {BsMicMuteFill} from "react-icons/bs";
import {HiMiniSpeakerWave} from "react-icons/hi2";
import type {Transcript, TtsVoice} from "../utils/types.ts";
import {Languages} from "../utils/languages.ts";
import {textToSpeech} from "../utils/text-to-speech.ts";

export interface TranscriptProps {
    transcript: Transcript;
    selectedVoices: Record<string, TtsVoice>;
    ttsPlaying: boolean;
    onTtsPlaying: (playing: boolean) => void;
}

function TranscriptBox(props: TranscriptProps) {
    return (
        <div className="flex-1 bg-base-100 rounded-lg shadow-lg overflow-hidden p-4">
            <div className="flex justify-between">
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
                                    anyPlaying={props.ttsPlaying}
                                    onPlaying={props.onTtsPlaying}
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
                                    anyPlaying={props.ttsPlaying}
                                    onPlaying={props.onTtsPlaying}
                                    visible={showPlayIconSecond}
                                />
                                <p className="text-gray-400">
                                    {part.translatedText}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <BsMicMuteFill
                    className={`transition duration-300 text-red-600 ${props.ttsPlaying ? "" : "opacity-0"}`}/>
            </div>
        </div>
    );
}

interface PlayTtsButtonProps {
    text: string;
    voice: VoiceId;
    anyPlaying: boolean;
    onPlaying: (playing: boolean) => void;
    visible: boolean;
}

function PlayTtsButton(props: PlayTtsButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    async function playTts() {
        if (isPlaying || props.anyPlaying) {
            return;
        }
        setIsPlaying(true);
        props.onPlaying(true);
        await textToSpeech(props.text, props.voice);
        setIsPlaying(false);
        props.onPlaying(false);
    }

    let className = "mr-2 transition duration-200 ";
    if (!props.visible) {
        className += "invisible";
    } else if (isPlaying) {
        className += "text-green-600 cursor-not-allowed";
    } else if (props.anyPlaying) {
        className += "opacity-50 cursor-not-allowed";
    } else {
        className += "hover:text-gray-500 cursor-pointer";
    }

    return (
        <HiMiniSpeakerWave
            className={className}
            onClick={playTts}
        />
    );
}

export default TranscriptBox;
