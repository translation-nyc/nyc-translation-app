import {useEffect, useRef, useState} from "react";
import {Amplify, fetchAuthSession} from "@aws-amplify/core";
import {TranscribeStreamingClient, type TranscriptResultStream,} from "@aws-sdk/client-transcribe-streaming";
import type {
    TranscribeStreamingClientConfig,
} from "@aws-sdk/client-transcribe-streaming/dist-types/TranscribeStreamingClient";
import type {Language, Transcript, TranscriptPart, TtsVoice} from "../../amplify/utils/types.ts";
import {Languages} from "../../amplify/utils/languages.ts";
import {SpeechTranscriber} from "../utils/speech-transcriber.ts";
import Controls from "./Controls.tsx";
import TranscriptBox from "./TranscriptBox.tsx";
import {translate} from "../utils/translation.ts";
import {getCurrentUser} from "aws-amplify/auth";
import {detectAmbiguity} from "../utils/ambiguity-detection.ts";

const EMPTY_TRANSCRIPT: Transcript = {
    parts: [],
    lastLanguageCode: Languages.ENGLISH.transcribeCode,
    lastTargetLanguageCode: null,
};

function TranscriptionInterface() {
    const speechTranscriber = useRef<SpeechTranscriber | null>(null);

    const [loggedIn, setLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isTranslating, setIsTranslating] = useState(false);

    const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
    const targetLanguageRef = useRef<Language | null>(null);

    const [selectedVoices, setSelectedVoices] = useState<Record<string, TtsVoice>>(
        Languages.ALL.reduce(
            (accumulator, language) => ({...accumulator, [language.name]: language.ttsVoices[0]}),
            {},
        )
    );
    const [transcript, setTranscript] = useState<Transcript>(EMPTY_TRANSCRIPT);

    const [ttsPlaying, setTtsPlaying] = useState(false);

    async function loadClient() {
        try {
            await getCurrentUser();
            setLoggedIn(true);
        } catch {
            setLoggedIn(false);
            return;
        }

        const region = Amplify.getConfig()
            .Predictions!
            .convert!
            .transcription!
            .region!;
        const authSession = await fetchAuthSession();
        const credentials = authSession.credentials!;
        const config: TranscribeStreamingClientConfig = {
            region,
            credentials,
        };
        const transcribeClient = new TranscribeStreamingClient(config);
        speechTranscriber.current = new SpeechTranscriber(transcribeClient, onTranscription);
        setIsLoading(false);
    }

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        loadClient();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function toggleTranslation() {
        if (speechTranscriber.current === null) {
            throw new Error("SpeechTranscriber is not initialized");
        }
        if (targetLanguage === null) {
            throw new Error("Target language is not set");
        }
        setIsTranslating(!isTranslating);
        if (!isTranslating) {
            await speechTranscriber.current.start(targetLanguage.transcribeCode);
        } else {
            await speechTranscriber.current.stop();
        }
    }

    function setLanguage(language: Language) {
        setTargetLanguage(language);
        targetLanguageRef.current = language;
    }

    function setVoice(voiceId: string) {
        setSelectedVoices(previousSelectedVoices => {
            const newSelectedVoices = {...previousSelectedVoices};
            newSelectedVoices[targetLanguage!.name] = targetLanguage!.ttsVoices.find(voice => voice.id === voiceId)!;
            return newSelectedVoices;
        });
    }

    function clearTranscript() {
        setTranscript(EMPTY_TRANSCRIPT);
    }

    function onTtsPlaying(playing: boolean) {
        setTtsPlaying(playing);
        speechTranscriber.current?.setMuted(playing);
    }

    async function onTranscription(event: TranscriptResultStream) {
        if (event.TranscriptEvent === undefined) {
            console.error("Transcription error");
            console.error(JSON.stringify(event));
            return;
        }

        const transcriptResults = event.TranscriptEvent.Transcript?.Results;
        if (transcriptResults === undefined || transcriptResults.length === 0) {
            return;
        }
        const transcriptResult = transcriptResults[0];
        const alternatives = transcriptResult.Alternatives;
        if (alternatives === undefined || alternatives.length === 0) {
            return;
        }
        const transcriptPartText = alternatives[0].Transcript;
        if (transcriptPartText === undefined) {
            return;
        }
        const languageCode = transcriptResult.LanguageCode ?? Languages.ENGLISH.transcribeCode;
        const language = Languages.get(languageCode);
        const resultId = transcriptResult.ResultId ?? "";

        const currentTargetLanguage = targetLanguageRef.current!;
        let otherLanguage: Language;
        if (language === Languages.ENGLISH) {
            otherLanguage = currentTargetLanguage;
        } else {
            otherLanguage = Languages.ENGLISH;
        }

        const translated = await translate(transcriptPartText, language.translateCode, otherLanguage.translateCode);
        const tempPart: TranscriptPart = {
            text: "",
            language: language,
            lastResultId: "",
            lastCompleteIndex: 0,
            translatedLanguage: otherLanguage,
            translatedText: translated,
            lastCompleteTranslatedIndex: 0,
            ambiguousWords: [],
        };
        const ambiguity = await detectAmbiguity([tempPart]);

        setTranscript(previousTranscript => {
            const newTranscriptParts = [...previousTranscript.parts];
            const lastIndex = newTranscriptParts.length - 1;
            const lastPart = newTranscriptParts[lastIndex];
            if (newTranscriptParts.length === 0
                || previousTranscript.lastLanguageCode !== languageCode && lastPart.lastResultId !== resultId
                || previousTranscript.lastTargetLanguageCode !== currentTargetLanguage.transcribeCode
            ) {
                newTranscriptParts.push({
                    text: transcriptPartText,
                    language: language,
                    lastResultId: resultId,
                    lastCompleteIndex: 0,
                    translatedText: translated,
                    translatedLanguage: otherLanguage,
                    lastCompleteTranslatedIndex: 0,
                    ambiguousWords: ambiguity
                });
            } else {
                const lastIndex = newTranscriptParts.length - 1;
                const lastPart = newTranscriptParts[lastIndex];
                if (lastPart.lastResultId === resultId) {
                    // In-progress transcription
                    if (previousTranscript.lastLanguageCode === languageCode) {
                        // Same language
                        const lastCompleteText = lastPart.text.slice(0, lastPart.lastCompleteIndex);
                        const lastCompleteTranslatedText = lastPart.translatedText.slice(0, lastPart.lastCompleteTranslatedIndex);

                        newTranscriptParts[lastIndex] = {
                            text: lastCompleteText + " " + transcriptPartText,
                            language: language,
                            lastResultId: resultId,
                            lastCompleteIndex: lastPart.lastCompleteIndex,
                            translatedText: lastCompleteTranslatedText + " " + translated,
                            translatedLanguage: otherLanguage,
                            lastCompleteTranslatedIndex: lastPart.lastCompleteTranslatedIndex,
                            ambiguousWords: lastPart.ambiguousWords,
                        };
                    } else {
                        // Different language
                        if (lastPart.lastCompleteIndex === 0) {
                            // Merge transcript parts if previous transcript part is empty
                            if (newTranscriptParts.length > 1) {
                                newTranscriptParts.pop();
                                const lastLastIndex = newTranscriptParts.length - 1;
                                const lastLastPart = newTranscriptParts[lastLastIndex];
                                newTranscriptParts[lastLastIndex] = {
                                    text: lastLastPart.text + " " + transcriptPartText,
                                    language: language,
                                    lastResultId: resultId,
                                    lastCompleteIndex: lastLastPart.lastCompleteIndex,
                                    translatedText: lastLastPart.translatedText + " " + translated,
                                    translatedLanguage: otherLanguage,
                                    lastCompleteTranslatedIndex: lastLastPart.lastCompleteTranslatedIndex,
                                    ambiguousWords: lastPart.ambiguousWords
                                };
                            } else {
                                newTranscriptParts[0] = {
                                    text: transcriptPartText,
                                    language: language,
                                    lastResultId: resultId,
                                    lastCompleteIndex: 0,
                                    translatedText: translated,
                                    translatedLanguage: otherLanguage,
                                    lastCompleteTranslatedIndex: 0,
                                    ambiguousWords: ambiguity
                                };
                            }
                        } else {
                            const lastCompleteText = lastPart.text.slice(0, lastPart.lastCompleteIndex);
                            const lastCompleteTranslatedText = lastPart.translatedText.slice(0, lastPart.lastCompleteTranslatedIndex);
                            newTranscriptParts[lastIndex] = {
                                text: lastCompleteText,
                                language: lastPart.language,
                                lastResultId: lastPart.lastResultId,
                                lastCompleteIndex: lastPart.lastCompleteIndex,
                                translatedText: lastCompleteTranslatedText,
                                translatedLanguage: lastPart.translatedLanguage,
                                lastCompleteTranslatedIndex: lastPart.lastCompleteTranslatedIndex,
                                ambiguousWords: lastPart.ambiguousWords,
                            };
                            newTranscriptParts.push({
                                text: transcriptPartText,
                                language: language,
                                lastResultId: resultId,
                                lastCompleteIndex: 0,
                                translatedText: translated,
                                translatedLanguage: otherLanguage,
                                lastCompleteTranslatedIndex: 0,
                                ambiguousWords: ambiguity
                            });
                        }
                    }
                } else {
                    // New transcription in the same language
                    newTranscriptParts[lastIndex] = {
                        text: lastPart.text + " " + transcriptPartText,
                        language: language,
                        lastResultId: resultId,
                        lastCompleteIndex: lastPart.text.length,
                        translatedText: lastPart.translatedText + " " + translated,
                        translatedLanguage: otherLanguage,
                        lastCompleteTranslatedIndex: lastPart.translatedText.length,
                        ambiguousWords: lastPart.ambiguousWords.concat(ambiguity),
                    };
                }
            }

            return {
                parts: newTranscriptParts,
                lastLanguageCode: languageCode,
                lastTargetLanguageCode: currentTargetLanguage.transcribeCode,
            };
        });
    }

    return (
        <div className="bg-base-200 flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-auto">
            <Controls
                isLoggedIn={loggedIn}
                isLoading={isLoading}
                isTranslating={isTranslating}
                onToggleTranslation={toggleTranslation}
                targetLanguage={targetLanguage}
                onChangeTargetLanguage={setLanguage}
                selectedVoices={selectedVoices}
                onChangeVoice={setVoice}
                transcript={transcript}
                onClearTranscript={clearTranscript}
            />
            <TranscriptBox
                transcript={transcript}
                isTranslating={isTranslating}
                selectedVoices={selectedVoices}
                ttsPlaying={ttsPlaying}
                onTtsPlaying={onTtsPlaying}
            />
        </div>
    );
}

export default TranscriptionInterface;
