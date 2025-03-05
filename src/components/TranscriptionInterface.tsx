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
import type {Language, Transcript} from "../utils/types.ts";
import {getLanguage} from "../utils/languages.ts";
import {SpeechTranscriber} from "../utils/speech-transcriber.ts";
import Controls from "./Controls.tsx";
import TranscriptBox from "./TranscriptBox.tsx";

function TranscriptionInterface() {
    const speechTranscriber = useRef<SpeechTranscriber | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isTranslating, setIsTranslating] = useState(false);

    const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);

    const [transcript, setTranscript] = useState<Transcript>({
        parts: [],
        lastLanguageCode: LanguageCode.EN_GB,
    });

    function onTranscription(event: TranscriptResultStream) {
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
        const language = getLanguage(languageCode);
        const resultId = transcriptResult.ResultId ?? "";

        setTranscript(previousTranscript => {
            const newTranscriptParts = [...previousTranscript.parts];
            if (newTranscriptParts.length === 0) {
                // No transcription yet
                newTranscriptParts.push({
                    text: transcriptPartText,
                    language: language,
                    lastResultId: resultId,
                    lastCompleteIndex: 0,
                });
            } else {
                const lastIndex = newTranscriptParts.length - 1;
                const lastPart = newTranscriptParts[lastIndex];
                if (lastPart.lastResultId === resultId) {
                    // In-progress transcription
                    const lastCompleteText = lastPart.text.slice(0, lastPart.lastCompleteIndex);
                    if (previousTranscript.lastLanguageCode === languageCode) {
                        // Same language
                        newTranscriptParts[lastIndex] = {
                            text: lastCompleteText + " " + transcriptPartText,
                            language: language,
                            lastResultId: resultId,
                            lastCompleteIndex: lastPart.lastCompleteIndex,
                        };
                    } else {
                        // Different language
                        if (lastCompleteText.length === 0) {
                            // Merge transcript parts if previous transcript part is empty
                            newTranscriptParts.pop();
                            const lastLastIndex = newTranscriptParts.length - 1;
                            const lastLastPart = newTranscriptParts[lastLastIndex];
                            newTranscriptParts[lastLastIndex] = {
                                text: lastLastPart.text + " " + transcriptPartText,
                                language: language,
                                lastResultId: resultId,
                                lastCompleteIndex: lastLastPart.lastCompleteIndex,
                            };
                        } else {
                            newTranscriptParts[lastIndex] = {
                                text: lastCompleteText,
                                language: lastPart.language,
                                lastResultId: lastPart.lastResultId,
                                lastCompleteIndex: lastPart.lastCompleteIndex,
                            };
                            newTranscriptParts.push({
                                text: transcriptPartText,
                                language: language,
                                lastResultId: resultId,
                                lastCompleteIndex: 0,
                            });
                        }
                    }
                } else {
                    // New transcription
                    if (previousTranscript.lastLanguageCode === languageCode) {
                        // Same language
                        newTranscriptParts[lastIndex] = {
                            text: lastPart.text + " " + transcriptPartText,
                            language: language,
                            lastResultId: resultId,
                            lastCompleteIndex: lastPart.text.length,
                        };
                    } else {
                        // Different language
                        newTranscriptParts.push({
                            text: transcriptPartText,
                            language: language,
                            lastResultId: resultId,
                            lastCompleteIndex: 0,
                        });
                    }
                }
            }

            return {
                parts: newTranscriptParts,
                lastLanguageCode: languageCode,
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
            await speechTranscriber.current.start(targetLanguage.code);
        } else {
            await speechTranscriber.current.stop();
        }
    }

    return (
        <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
            <Controls
                isLoading={isLoading}
                isTranslating={isTranslating}
                onToggleTranslation={toggleTranslation}
                targetLanguage={targetLanguage}
                onChangeTargetLanguage={setTargetLanguage}
                transcript={transcript}
            />
            <TranscriptBox transcript={transcript}/>
        </div>
    );
}

export default TranscriptionInterface;
