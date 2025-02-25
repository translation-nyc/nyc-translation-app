import {useEffect, useRef, useState} from "react";
import {Amplify, fetchAuthSession} from "@aws-amplify/core";
import {TranscribeStreamingClient, type TranscriptResultStream} from "@aws-sdk/client-transcribe-streaming";
import type {
    TranscribeStreamingClientConfig,
} from "@aws-sdk/client-transcribe-streaming/dist-types/TranscribeStreamingClient";
import {SpeechTranscriber} from "../utils/speech-transcriber.ts";
import Controls from "./Controls.tsx";
import Transcript from "./Transcript.tsx";

interface Transcript {
    parts: string[];
    lastId: string;
}

function TranscriptionInterface() {
    const speechTranscriber = useRef<SpeechTranscriber | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isTranslating, setIsTranslating] = useState(false);

    const [targetLanguage, setTargetLanguage] = useState("");

    const [transcript, setTranscript] = useState<Transcript>({
        parts: [],
        lastId: "",
    });
    const transcriptString = transcript.parts.join(" ");

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
        const transcriptPart = alternatives[0].Transcript;
        if (transcriptPart === undefined) {
            return;
        }

        setTranscript(previousTranscriptParts => {
            const newTranscriptParts = [...previousTranscriptParts.parts];
            if (newTranscriptParts.length === 0) {
                newTranscriptParts.push(transcriptPart);
            } else if (previousTranscriptParts.lastId === transcriptResult.ResultId) {
                newTranscriptParts[newTranscriptParts.length - 1] = transcriptPart;
            } else {
                newTranscriptParts.push(transcriptPart);
            }
            return {
                parts: newTranscriptParts,
                lastId: transcriptResult.ResultId || "",
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
            return;
        }
        setIsTranslating(!isTranslating);
        if (!isTranslating) {
            await speechTranscriber.current.start();
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
                transcript={transcriptString}
            />
            <Transcript transcript={transcriptString}/>
        </div>
    );
}

export default TranscriptionInterface;
