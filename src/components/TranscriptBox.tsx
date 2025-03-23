import {type MouseEvent, useRef, useState} from "react";
import type {VoiceId} from "@aws-sdk/client-polly";
import {MicOff, Volume2} from "lucide-react";
import type {Phrase, Transcript, TtsVoice} from "../../amplify/utils/types.ts";
import {Languages} from "../../amplify/utils/languages.ts";
import {textToSpeech} from "../utils/text-to-speech.ts";
import {usePopup} from "./Popup.tsx";

export interface TranscriptProps {
    transcript: Transcript;
    isTranslating: boolean;
    selectedVoices: Record<string, TtsVoice>;
    ttsPlaying: boolean;
    onTtsPlaying: (playing: boolean) => void;
}

function TranscriptBox(props: TranscriptProps) {
    const {showPopup} = usePopup();

    const showDisambiguationPopup = (e: MouseEvent, alternateDefinition: string) => {
        if (alternateDefinition) {
            showPopup(
                <div>
                    <h3 className="card-title">
                        Alternative Translation
                    </h3>
                    <p className={"text-sm"}>
                        This could also mean:
                    </p>
                    <p>
                        "{alternateDefinition}"
                    </p>
                </div>,
                e.clientX,
                e.clientY,
            );
        }
    };

    return (
        <div className="flex-1 bg-base-100 rounded-lg shadow-lg p-4">
            <div className="w-full h-full relative">
                <div className="w-full h-full absolute top-0 left-0">
                    <div className="max-h-96 md:h-0 min-h-full overflow-auto">
                        <div className="mr-4">
                            {props.transcript.parts.map((part, index) => {
                                let className: string | undefined;
                                if (index === props.transcript.parts.length - 1) {
                                    className = undefined;
                                } else {
                                    className = "mb-4";
                                }

                                let showPlayIconFirst: boolean;
                                let showPlayIconSecond: boolean;
                                if (part.language === Languages.ENGLISH) {
                                    showPlayIconFirst = false;
                                    showPlayIconSecond = true;
                                } else {
                                    showPlayIconFirst = true;
                                    showPlayIconSecond = false;
                                }

                                const ambiguity = addAmbiguityInformation(
                                    part.ambiguousWords,
                                    part.translatedText,
                                ).split("*");
                                const ambiguousWordMap = new Map();
                                part.ambiguousWords.forEach(amb => {
                                    ambiguousWordMap.set(amb.text, amb.alternateDefinition);
                                });

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
                                            <div className="flex-wrap items-center">
                                                {ambiguity.map((amb) => {
                                                    const ambText = amb.replace("(", "").replace(")", "");
                                                    const ambAlternateDefinition: string = ambiguousWordMap.get(ambText);
                                                    return (
                                                    <span
                                                        key={ambiguity.indexOf(amb)}
                                                        className={ambiguity.indexOf(amb) % 2 == 1 && ambAlternateDefinition ? "text-accent mx-0.5 " : "text-gray-400 "}
                                                        onClick={e => showDisambiguationPopup(e, ambAlternateDefinition)}>
                                                        {ambText}
                                                    </span>);
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="absolute top-2 right-2 pointer-events-none">
                    <MicOff
                        className={`transition duration-300 text-red-600 ${props.ttsPlaying && props.isTranslating ? "" : "opacity-0"}`}
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
        <Volume2
            className={`mr-2 shrink-0 transition duration-200 ${className}`}
            onClick={toggleTts}
        />
    );
}

function addAmbiguityInformation(phrases: Phrase[], text: string): string {
    let finalText = text;
    for (const phrase of phrases) {
        const index = text.indexOf(phrase.text);
        const temp = split_at_index(finalText, index, false);
        finalText = split_at_index(temp, index + phrase.text.length + 2, true);
    }
    return finalText;
}

function split_at_index(value:string, index:number, end:boolean) {
    if (end) {
        return value.substring(0, index) + ")*" + value.substring(index);
    } else {
        return value.substring(0, index) + "*(" + value.substring(index);
    }
}

export default TranscriptBox;
