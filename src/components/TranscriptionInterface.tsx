import {useEffect, useState} from "react";
import {TranscribeStreamingClient, type TranscriptResultStream} from "@aws-sdk/client-transcribe-streaming";
import type {
    TranscribeStreamingClientConfig,
} from "@aws-sdk/client-transcribe-streaming/dist-types/TranscribeStreamingClient";
import {client} from "../main.tsx";
import type {TranscribeDetails} from "../../amplify/functions/transcribe-details/handler.ts";
import {SpeechTranscriber} from "../utils/speech-transcriber.ts";
import Controls from "./Controls.tsx";
import Transcript from "./Transcript.tsx";

let speechTranscriber: SpeechTranscriber;

function TranscriptionInterface() {
    const [isLoading, setIsLoading] = useState(true);
    const [isTranslating, setIsTranslating] = useState(false);

    function onTranscription(event: TranscriptResultStream) {
        console.log(JSON.stringify(event));
    }

    async function loadClient() {
        const transcribeDetailsResponse = await client.queries.getTranscribeDetails();
        const transcribeDetails = JSON.parse(transcribeDetailsResponse.data!) as TranscribeDetails;
        const config: TranscribeStreamingClientConfig = {
            region: transcribeDetails.region,
            credentials: {
                accessKeyId: transcribeDetails.accessKeyId,
                secretAccessKey: transcribeDetails.secretAccessKey,
            },
        };
        const transcribeClient = new TranscribeStreamingClient(config);
        speechTranscriber = new SpeechTranscriber(transcribeClient, onTranscription);
        setIsLoading(false);
    }

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        loadClient();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function toggleTranslation() {
        setIsTranslating(!isTranslating);
        if (!isTranslating) {
            await speechTranscriber.start();
        } else {
            await speechTranscriber.stop();
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
