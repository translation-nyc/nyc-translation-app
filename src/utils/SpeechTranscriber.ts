import {
    type AudioStream,
    LanguageCode,
    MediaEncoding,
    StartStreamTranscriptionCommand,
    TranscribeStreamingClient,
    type TranscriptResultStream,
} from "@aws-sdk/client-transcribe-streaming";
import {
    StartStreamTranscriptionCommandInput,
} from "@aws-sdk/client-transcribe-streaming/dist-types/commands/StartStreamTranscriptionCommand";
import {
    TranscribeStreamingClientConfig,
} from "@aws-sdk/client-transcribe-streaming/dist-types/TranscribeStreamingClient";
import {AsyncBlockingQueue} from "./AsyncBlockingQueue";

export class SpeechTranscriber {

    private readonly onTranscription: (event: TranscriptResultStream) => void;

    private mediaStream: MediaStream | undefined;
    private mediaRecorder: MediaRecorder | undefined;
    private transcribeClient: TranscribeStreamingClient | undefined;

    constructor(onTranscription: (event: TranscriptResultStream) => void) {
        this.onTranscription = onTranscription;
    }

    async start() {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
            },
        });

        const options: MediaRecorderOptions = {
            mimeType: "audio/ogg; codecs=opus"
        };
        this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

        const queue = new AsyncBlockingQueue<Blob>();

        this.mediaRecorder.ondataavailable = event => {
            queue.enqueue(event.data);
        };
        this.mediaRecorder.start(1000);

        const env = import.meta.env
        const config: TranscribeStreamingClientConfig = {
            region: env.VITE_AWS_TRANSCRIBE_REGION,
            credentials: {
                accessKeyId: env.VITE_AWS_TRANSCRIBE_ACCESS_KEY_ID,
                secretAccessKey: env.VITE_AWS_TRANSCRIBE_SECRET_ACCESS_KEY,
            },
        }
        this.transcribeClient = new TranscribeStreamingClient(config);

        const audioContext = new AudioContext();
        const params: StartStreamTranscriptionCommandInput = {
            LanguageCode: LanguageCode.EN_GB,
            MediaEncoding: MediaEncoding.OGG_OPUS,
            MediaSampleRateHertz: audioContext.sampleRate,
            AudioStream: (async function* (): AsyncGenerator<AudioStream.AudioEventMember> {
                for await (const chunk of queue) {
                    const data = await blobToUint8Array(chunk);
                    yield {
                        AudioEvent: {
                            AudioChunk: data,
                        },
                    };
                }
            })(),
        };

        const command = new StartStreamTranscriptionCommand(params);
        const response = await this.transcribeClient.send(command);
        for await (const event of response.TranscriptResultStream!) {
            this.onTranscription(event);
        }
    }

    stop() {
        this.mediaRecorder?.stop();
        this.mediaStream?.getTracks().forEach(track => track.stop());
        this.transcribeClient?.destroy();
    }
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
    const buffer = await new Response(blob).arrayBuffer();
    return new Uint8Array(buffer);
}
