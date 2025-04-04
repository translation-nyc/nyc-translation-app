import {useEffect, useState} from "react";
import type {VoiceId} from "@aws-sdk/client-polly";
import type {Font, Language, Transcript, TtsVoice} from "../../amplify/utils/types.ts";
import {Languages} from "../../amplify/utils/languages.ts";
import {PlayIcon, StopIcon} from "../assets/icons";
import {useDialog} from "../hooks/use-dialog.ts";
import Alert from "./Alert.tsx";
import TranscriptModal from "./TranscriptModal.tsx";

export interface ControlsProps {
    isLoggedIn: boolean;
    isLoading: boolean;
    isTranslating: boolean;
    onToggleTranslation: () => void;
    targetLanguage: Language | null;
    onChangeTargetLanguage: (language: Language) => void;
    selectedVoices: Record<string, TtsVoice>;
    onChangeVoice: (voiceId: VoiceId) => void;
    transcript: Transcript;
    onClearTranscript: () => void;
    /**
     * For test mocking purposes.
     */
    fonts?: Record<string, Font>;
}

function Controls(props: ControlsProps) {
    return (
        <div className="w-full md:w-72 p-2 bg-base-100 rounded-lg shadow-lg">
            <div className="max-h-40 md:h-0 min-h-full p-4 overflow-auto">
                <ToggleTranslationButton
                    isLoggedIn={props.isLoggedIn}
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
                    selectedVoices={props.selectedVoices}
                    onChangeVoice={props.onChangeVoice}
                />
                <ReviewButton
                    transcript={props.transcript}
                    fonts={props.fonts}
                />
                <ClearTranscriptButton
                    transcript={props.transcript}
                    onClearTranscript={props.onClearTranscript}
                />
            </div>
        </div>
    );
}

interface ToggleTranslationButtonProps {
    isLoggedIn: boolean;
    isLoading: boolean;
    isTranslating: boolean;
    onToggleTranslation: () => void;
    targetLanguage: Language | null;
}

function ToggleTranslationButton(props: ToggleTranslationButtonProps) {
    return (
        <div className="flex justify-center mb-6">
            <button
                className={`btn w-full ${props.isTranslating ? "btn-error" : "btn-success"}`}
                aria-label="Toggle translation button"
                disabled={!props.isLoggedIn || props.isLoading || props.targetLanguage === null}
                onClick={props.onToggleTranslation}
            >
                {(() => {
                    if (!props.isLoggedIn) {
                        return "Please login";
                    } else if (props.isLoading) {
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
        <div className="space-y-2 mb-6">
            <div>
                <h3 className="font-bold text-lg">
                    Target Language
                </h3>
            </div>

            <select
                className="select select-bordered w-full"
                aria-label="Select language"
                defaultValue="default"
                disabled={props.isTranslating}
                onChange={e => props.onChangeTargetLanguage(languagesNoEnglish[parseInt(e.target.value)])}
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

            <p aria-label="Selected language status">
                The currently selected language is: {props.targetLanguage?.name ?? "none"}
            </p>
        </div>
    );
}

interface VoiceSelectorProps {
    targetLanguage: Language | null;
    selectedVoices: Record<string, TtsVoice | undefined>;
    onChangeVoice: (voiceId: VoiceId) => void;
}

function VoiceSelector(props: VoiceSelectorProps) {
    const selectedVoice = props.selectedVoices[props.targetLanguage?.name ?? ""];
    const voices = props.targetLanguage?.ttsVoices ?? [];

    return (
        <div className="space-y-2 mb-6">
            <div>
                <h3 className="font-bold text-lg">
                    Voice
                </h3>
            </div>

            <select
                className="select select-bordered w-full"
                aria-label="Select voice"
                disabled={props.targetLanguage === null}
                value={selectedVoice?.id}
                onChange={e => props.onChangeVoice(e.target.value as VoiceId)}
            >
                {voices.map((voice, index) =>
                    <option key={index} value={voice.id}>
                        {voice.name ?? voice.id}
                    </option>
                )}
            </select>

            <p aria-label="Selected voice status">
                The currently selected voice is: {(selectedVoice?.name ?? selectedVoice?.id) ?? "none"}
            </p>
        </div>
    );
}

interface ReviewButtonProps {
    transcript: Transcript;
    /**
     * For test mocking purposes.
     */
    fonts?: Record<string, Font>;
}

function ReviewButton(props: ReviewButtonProps) {
    const transcript = props.transcript.parts.map(part =>
        part.text + "\n" + part.translatedText
    ).join("\n\n");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [fonts, setFonts] = useState<Record<string, Font>>({});
    const [showEmailedAlert, setShowEmailedAlert] = useState(false);

    async function loadFonts() {
        if (props.fonts !== undefined) {
            setFonts(props.fonts);
            setFontsLoaded(true);
            return;
        }

        const {notoArabic} = await import("../../amplify/fonts/noto-arabic-normal");
        const {notoChinese} = await import("../../amplify/fonts/noto-chinese-normal");
        const {notoJapanese} = await import("../../amplify/fonts/noto-japanese-normal");
        const {notoKorean} = await import("../../amplify/fonts/noto-korean-normal");
        const newFonts = {
            notoArabic,
            notoChinese,
            notoJapanese,
            notoKorean,
        };
        setFonts(newFonts);
        setFontsLoaded(true);
    }

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        loadFonts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function openModal() {
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    return (
        <>
            <button
                className="btn btn-primary w-full mb-6"
                aria-label="Review button"
                disabled={!fontsLoaded || props.transcript.parts.length === 0}
                onClick={openModal}
            >
                {fontsLoaded ? "Review" : "Loading..."}
            </button>

            {isModalOpen && (
                <TranscriptModal
                    transcription={transcript}
                    closeModal={closeModal}
                    transcript={props.transcript}
                    fonts={fonts}
                    onEmailSent={() => setShowEmailedAlert(true)}
                />
            )}

            <Alert
                message="Email sent!"
                isVisible={showEmailedAlert}
                onDismiss={() => setShowEmailedAlert(false)}
                autoDismissTime={3000}
            />
        </>
    );
}

interface ClearTranscriptButtonProps {
    transcript: Transcript;
    onClearTranscript: () => void;
}

function ClearTranscriptButton(props: ClearTranscriptButtonProps) {
    const {dialogRef, openDialog} = useDialog();

    function clearTranscript() {
        props.onClearTranscript();
    }

    return (
        <>
            <button
                className="btn btn-error w-full"
                aria-label="Clear transcript button"
                disabled={props.transcript.parts.length === 0}
                onClick={openDialog}
            >
                Clear transcript
            </button>

            <dialog ref={dialogRef} className="modal">
                <div className="modal-box p-4">
                    <div className="flex w-full flex-col">
                        <h1 className="font-bold text-xl mb-4">
                            Are you sure you want to clear the transcript?
                        </h1>
                        <form method="dialog">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    className="btn btn-error"
                                    onClick={clearTranscript}
                                >
                                    Clear transcript
                                </button>
                                <button className="btn btn-primary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default Controls;
