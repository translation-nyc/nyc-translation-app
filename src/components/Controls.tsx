import {useState} from "react";
import type {Language, Transcript, TtsVoice} from "../utils/types.ts";
import {Languages} from "../utils/languages.ts";
import {PlayIcon, StopIcon} from "../assets/icons";
import TranscriptModal from "./TranscriptModal.tsx";

export interface ControlsProps {
    isLoading: boolean;
    isTranslating: boolean;
    onToggleTranslation: () => void;
    targetLanguage: Language | null;
    onChangeTargetLanguage: (language: Language) => void;
    voices: TtsVoice[],
    selectedVoices: Record<string, TtsVoice>;
    onChangeVoice: (voiceId: string) => void;
    transcript: Transcript;
}

function Controls(props: ControlsProps) {
    return (
        <div className="w-full md:w-72 bg-base-100 rounded-lg shadow-lg p-6">
            <div className="max-h-40 md:h-0 min-h-full overflow-auto">
                <div className="space-y-6">
                    <ToggleTranslationButton
                        isLoading={props.isLoading}
                        isTranslating={props.isTranslating}
                        onToggleTranslation={props.onToggleTranslation}
                        targetLanguage={props.targetLanguage}
                    />
                    <LanguageSelector
                        isTranslating={props.isTranslating}
                        targetLanguage={props.targetLanguage}
                        onChangeTargetLanguage={props.onChangeTargetLanguage}
                    />
                    <VoiceSelector
                        targetLanguage={props.targetLanguage}
                        voices={props.voices}
                        selectedVoices={props.selectedVoices}
                        onChangeVoice={props.onChangeVoice}
                    />
                    <ReviewButton
                        transcript={props.transcript}
                    />
                </div>
            </div>
        </div>
    );
}

interface ToggleTranslationButtonProps {
    isLoading: boolean;
    isTranslating: boolean;
    onToggleTranslation: () => void;
    targetLanguage: Language | null;
}

function ToggleTranslationButton(props: ToggleTranslationButtonProps) {
    return (
        <div className="flex justify-center">
            <button
                className={`btn w-full ${props.isTranslating ? "btn-error" : "btn-success"}`}
                disabled={props.isLoading || props.targetLanguage === null}
                onClick={props.onToggleTranslation}
            >
                {(() => {
                    if (props.isLoading) {
                        return "Loading...";
                    } else if (props.targetLanguage === null) {
                        return "Select a language";
                    } else if (props.isTranslating) {
                        return (
                            <>
                                <StopIcon className="mr-2 h-5 w-5"/>
                                Stop Translation
                            </>
                        );
                    } else {
                        return (
                            <>
                                <PlayIcon className="mr-2 h-5 w-5"/>
                                Start Translation
                            </>
                        );
                    }
                })()}
            </button>
        </div>
    );
}

interface LanguageSelectorProps {
    isTranslating: boolean;
    targetLanguage: Language | null;
    onChangeTargetLanguage: (language: Language) => void;
}

function LanguageSelector(props: LanguageSelectorProps) {
    const languagesNoEnglish = Languages.ALL.filter(language => language !== Languages.ENGLISH);

    return (
        <div className="space-y-2">
            <div>
                <h3 className="font-bold text-lg">
                    Target Language
                </h3>
            </div>

            <select
                className="select select-bordered w-full"
                onChange={e => props.onChangeTargetLanguage(languagesNoEnglish[parseInt(e.target.value)])}
                defaultValue="default"
                disabled={props.isTranslating}
            >
                <option disabled hidden value="default">
                    Select a language
                </option>
                {languagesNoEnglish.map((language, index) =>
                    <option key={index} value={index}>
                        {language.name}
                    </option>
                )}
            </select>

            <div>
                The currently selected language is: {props.targetLanguage?.name ?? "none"}
            </div>
        </div>
    );
}

interface VoiceSelectorProps {
    targetLanguage: Language | null;
    voices: TtsVoice[],
    selectedVoices: Record<string, TtsVoice | undefined>;
    onChangeVoice: (voiceId: string) => void;
}

function VoiceSelector(props: VoiceSelectorProps) {
    const selectedVoice = props.selectedVoices[props.targetLanguage?.name ?? ""];

    return (
        <div className="space-y-2">
            <div>
                <h3 className="font-bold text-lg">
                    Voice
                </h3>
            </div>

            <select
                className="select select-bordered w-full"
                onChange={e => props.onChangeVoice(e.target.value)}
                value={selectedVoice?.id}
                disabled={props.targetLanguage === null}
            >
                {props.voices.map((voice, index) =>
                    <option key={index} value={voice.id}>
                        {voice.name ?? voice.id}
                    </option>
                )}
            </select>

            <div>
                The currently selected voice is: {(selectedVoice?.name ?? selectedVoice?.id) ?? "none"}
            </div>
        </div>
    );
}

interface ReviewButtonProps {
    transcript: Transcript;
}

function ReviewButton(props: ReviewButtonProps) {
    const transcript = props.transcript.parts.map(part =>
        part.text + "\n" + part.translatedText
    ).join("\n\n");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <div>
                <button
                    className="btn btn-primary w-full"
                    onClick={openModal}
                >
                    Review
                </button>
            </div>

            {isModalOpen && (
                <TranscriptModal transcription={transcript} closeModal={closeModal}/>
            )}
        </>
    );
}

export default Controls;
