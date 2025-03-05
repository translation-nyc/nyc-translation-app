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
import {Language, Transcript} from "../utils/types.ts";
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
        const resultId = transcriptResult.ResultId ?? "";

        setTranscript(previousTranscript => {
            const newTranscriptParts = [...previousTranscript.parts];
            if (newTranscriptParts.length === 0) {
                // No transcription yet
                const language = getLanguage(languageCode);
                newTranscriptParts.push({
                    text: transcriptPartText,
                    language: language,
                    resultId: resultId,
                    lastCompleteIndex: 0,
                });
            } else {
                let newText: string;
                let newResultId = resultId;
                let newLastCompleteIndex: number;
                const lastIndex = newTranscriptParts.length - 1;
                const lastPart = newTranscriptParts[lastIndex];
                if (lastPart.resultId === resultId) {
                    // In-progress transcription
                    newText = lastPart.text.slice(0, lastPart.lastCompleteIndex);
                    if (previousTranscript.lastLanguageCode === languageCode) {
                        // Same language
                        newText += " " + transcriptPartText;
                    } else {
                        // Different language
                        newResultId = lastPart.resultId;
                    }
                    newLastCompleteIndex = lastPart.lastCompleteIndex;
                } else {
                    // New transcription
                    newText = lastPart.text + " " + transcriptPartText;
                    newLastCompleteIndex = lastPart.text.length;
                }

                if (newText.length === 0) {
                    // Remove in-progress transcription if language changed
                    newTranscriptParts.pop();
                } else {
                    const previousLanguage = getLanguage(previousTranscript.lastLanguageCode);
                    newTranscriptParts[lastIndex] = {
                        text: newText,
                        language: previousLanguage,
                        resultId: newResultId,
                        lastCompleteIndex: newLastCompleteIndex,
                    };
                }

                if (previousTranscript.lastLanguageCode !== languageCode) {
                    const language = getLanguage(languageCode);
                    newTranscriptParts.push({
                        text: transcriptPartText,
                        language: language,
                        resultId: resultId,
                        lastCompleteIndex: 0,
                    });
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
        setIsTranslating(!isTranslating);
        if (!isTranslating) {
            await speechTranscriber.current.start();
        } else {
            await speechTranscriber.current.stop();
        }
    }

    function setLanguage(language: Language) {
        if (speechTranscriber.current === null) {
            throw new Error("SpeechTranscriber is not initialized");
        } else {
            speechTranscriber.current.language = language.code;
        }
        setTargetLanguage(language);
    }

    return (
        <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
            <Controls
                isLoading={isLoading}
                isTranslating={isTranslating}
                onToggleTranslation={toggleTranslation}
                targetLanguage={targetLanguage}
                onChangeTargetLanguage={setLanguage}
                transcript={transcript}
            />
            <TranscriptBox transcript={transcript}/>
        </div>
    );
}

export default TranscriptionInterface;
