import {useEffect, useRef, useState} from "react";
import {Amplify, fetchAuthSession} from "@aws-amplify/core";
import {
    LanguageCode,
    TranscribeStreamingClient,
    type TranscriptResultStream
} from "@aws-sdk/client-transcribe-streaming";
import type {
    TranscribeStreamingClientConfig,
} from "@aws-sdk/client-transcribe-streaming/dist-types/TranscribeStreamingClient";
import type {Language, Transcript, TtsVoice} from "../utils/types.ts";
import {Languages} from "../utils/languages.ts";
import {SpeechTranscriber} from "../utils/speech-transcriber.ts";
import Controls from "./Controls.tsx";
import TranscriptBox from "./TranscriptBox.tsx";
import {translate} from "../utils/translation.ts";

function TranscriptionInterface() {
    const speechTranscriber = useRef<SpeechTranscriber | null>(null);

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

    const [transcript, setTranscript] = useState<Transcript>({
        parts: [],
        lastLanguageCode: LanguageCode.EN_GB,
        lastTargetLanguageCode: null,
    });

    async function onTranscription(event: TranscriptResultStream) {
        if (event.TranscriptEvent === undefined) {
            console.error("Transcription error");
            console.error(event);
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
        const languageCode = transcriptResult.LanguageCode ?? LanguageCode.EN_GB;
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

        setTranscript(previousTranscript => {
            const newTranscriptParts = [...previousTranscript.parts];
            if (newTranscriptParts.length === 0
                || previousTranscript.lastLanguageCode !== languageCode
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
                            };
                            newTranscriptParts.push({
                                text: transcriptPartText,
                                language: language,
                                lastResultId: resultId,
                                lastCompleteIndex: 0,
                                translatedText: translated,
                                translatedLanguage: otherLanguage,
                                lastCompleteTranslatedIndex: 0,
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

    async function loadClient() {
        const region = Amplify.getConfig()
            .Predictions!
            .convert!
            .transcription!
            .region!;
        const authSession = await fetchAuthSession();
        const credentials = authSession.credentials!;
        const config: TranscribeStreamingClientConfig = {
            region: region,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken,
            },
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

    return (
        <div className="bg-base-200 flex-1 flex flex-col md:flex-row p-4 gap-4">
            <Controls
                isLoading={isLoading}
                isTranslating={isTranslating}
                onToggleTranslation={toggleTranslation}
                targetLanguage={targetLanguage}
                onChangeTargetLanguage={setLanguage}
                voices={targetLanguage?.ttsVoices ?? []}
                selectedVoices={selectedVoices}
                onChangeVoice={setVoice}
                transcript={transcript}
            />
            <TranscriptBox
                transcript={transcript}
                selectedVoices={selectedVoices}
            />
        </div>
    );
}

export default TranscriptionInterface;
