import {useEffect, useRef, useState} from "react";
import {Amplify, fetchAuthSession} from "@aws-amplify/core";
import {TranscribeStreamingClient, type TranscriptResultStream} from "@aws-sdk/client-transcribe-streaming";
import type {
    TranscribeStreamingClientConfig,
} from "@aws-sdk/client-transcribe-streaming/dist-types/TranscribeStreamingClient";
import {SpeechTranscriber} from "../utils/speech-transcriber.ts";
import Controls from "./Controls.tsx";
import Transcript from "./Transcript.tsx";

function TranscriptionInterface() {
    const speechTranscriber = useRef<SpeechTranscriber | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isTranslating, setIsTranslating] = useState(false);

    function onTranscription(event: TranscriptResultStream) {
        console.log(JSON.stringify(event));
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
            />
            <Transcript/>
        </div>
    );
}

export default TranscriptionInterface;
