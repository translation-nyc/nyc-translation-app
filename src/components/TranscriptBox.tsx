import {useRef, useState} from "react";
import type {VoiceId} from "@aws-sdk/client-polly";
import {BsMicMuteFill} from "react-icons/bs";
import {HiMiniSpeakerWave} from "react-icons/hi2";
import type {Transcript, TtsVoice} from "../utils/types.ts";
import {Languages} from "../utils/languages.ts";
import {textToSpeech} from "../utils/text-to-speech.ts";

export interface TranscriptProps {
    transcript: Transcript;
    isTranslating: boolean;
    selectedVoices: Record<string, TtsVoice>;
    ttsPlaying: boolean;
    onTtsPlaying: (playing: boolean) => void;
}

function TranscriptBox(props: TranscriptProps) {
    return (
        <div className="flex-1 bg-base-100 rounded-lg shadow-lg p-4">
            <div className="max-h-96 md:h-0 min-h-full overflow-auto">
                <div className="flex justify-between">
                    <div>
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
                            let className: string | undefined;
                            if (index === props.transcript.parts.length - 1) {
                                className = undefined;
                            } else {
                                className = "mb-4";
                            }
                            return (
                                <div key={index} className={className}>
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
                    </div>
                    <BsMicMuteFill
                        className={`shrink-0 ml-2 transition duration-300 text-red-600 mr-2 ${props.ttsPlaying && props.isTranslating ? "" : "opacity-0"}`}
                    />
                </div>
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
    const audioRef = useRef<HTMLAudioElement | null>(null);

    async function toggleTts() {
        if (isPlaying) {
            audioRef.current?.pause();
            audioRef.current = null;
            setIsPlaying(false);
            props.onPlaying(false);
            return;
        }
        if (props.anyPlaying) {
            return;
        }
        setIsPlaying(true);
        props.onPlaying(true);
        const audio = await textToSpeech(props.text, props.voice);
        audio.onended = () => {
            audioRef.current = null;
            setIsPlaying(false);
            props.onPlaying(false);
        };
        audioRef.current = audio;
    }

    let className: string;
    if (!props.visible) {
        className = "invisible";
    } else if (isPlaying) {
        className = "text-green-600 cursor-pointer hover:text-green-700";
    } else if (props.anyPlaying) {
        className = "opacity-50 cursor-not-allowed";
    } else {
        className = "hover:text-gray-500 cursor-pointer";
    }

    return (
        <HiMiniSpeakerWave
            className={`mr-2 shrink-0 transition duration-200 ${className}`}
            onClick={toggleTts}
        />
    );
}

export default TranscriptBox;
