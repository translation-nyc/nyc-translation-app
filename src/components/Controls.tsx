import {useState} from "react";
import type {Language, Transcript} from "../utils/types.ts";
import {ENGLISH, Languages} from "../utils/languages.ts";
import {textToSpeech} from "../utils/text-to-speech.ts";
import {PlayIcon, StopIcon} from "../assets/icons";
import TranscriptModal from "./TranscriptModal.tsx";

export interface ControlsProps {
    isLoading: boolean;
    isTranslating: boolean;
    onToggleTranslation: () => void;
    targetLanguage: Language | null;
    onChangeTargetLanguage: (language: Language) => void;
    transcript: Transcript;
}

function Controls(props: ControlsProps) {
    return (
        <div className="w-full md:w-72 bg-base-100 rounded-lg shadow-lg p-6">
            <div className="space-y-6">
                <ToggleTranslationButton {...props}/>
                <LanguageSelector {...props}/>
                <AutoPunctuationSwitch/>
                <TextToSpeechButton {...props}/>
                <ReviewButton {...props}/>
            </div>
        </div>
    );
}

function ToggleTranslationButton(props: ControlsProps) {
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

function LanguageSelector(props: ControlsProps) {
    const languagesNoEnglish = Languages.filter(language => language !== ENGLISH);

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

function AutoPunctuationSwitch() {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isChecked}
                    onChange={e => setIsChecked(e.target.checked)}
                />
                <span className="label-text">
                    Auto-punctuation
                </span>
            </label>
        </div>
    );
}

function TextToSpeechButton(props: ControlsProps) {
    async function playTranscript() {
        const transcriptString = props.transcript.parts
            .map(part => part.text)
            .join(" ");
        await textToSpeech(transcriptString);
    }

    return (
        <div>
            <button
                className="btn btn-primary w-full"
                onClick={playTranscript}
            >
                Play Transcription
            </button>
        </div>
    );
}

function ReviewButton(props: ControlsProps) {
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
