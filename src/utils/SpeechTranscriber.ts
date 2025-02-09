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

    private audioContext: AudioContext | undefined;
    private audioWorkletNode: AudioWorkletNode | undefined;
    private mediaStream: MediaStream | undefined;
    private audioSource: MediaStreamAudioSourceNode | undefined;
    private transcribeClient: TranscribeStreamingClient | undefined;

    constructor(onTranscription: (event: TranscriptResultStream) => void) {
        this.onTranscription = onTranscription;
    }

    async start() {
        this.audioContext = new AudioContext();
        await this.audioContext.audioWorklet.addModule("pcm-processor.js");

        const audioQueue = new AsyncBlockingQueue<ArrayBuffer>();

        this.audioWorkletNode = new AudioWorkletNode(this.audioContext, "pcm-processor");
        this.audioWorkletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
            audioQueue.enqueue(event.data);
        };

        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
            },
        });
        this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.audioSource.connect(this.audioWorkletNode);

        const env = import.meta.env
        const config: TranscribeStreamingClientConfig = {
            region: env.VITE_AWS_TRANSCRIBE_REGION,
            credentials: {
                accessKeyId: env.VITE_AWS_TRANSCRIBE_ACCESS_KEY_ID,
                secretAccessKey: env.VITE_AWS_TRANSCRIBE_SECRET_ACCESS_KEY,
            },
        }
        this.transcribeClient = new TranscribeStreamingClient(config);

        const params: StartStreamTranscriptionCommandInput = {
            LanguageCode: LanguageCode.EN_GB,
            MediaEncoding: MediaEncoding.PCM,
            MediaSampleRateHertz: this.audioContext.sampleRate,
            AudioStream: (async function* (): AsyncGenerator<AudioStream.AudioEventMember> {
                for await (const data of audioQueue) {
                    yield {
                        AudioEvent: {
                            AudioChunk: new Uint8Array(data),
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

    async stop() {
        this.audioWorkletNode?.disconnect();
        this.audioSource?.disconnect();
        await this.audioContext?.close();
        this.mediaStream?.getTracks().forEach(track => track.stop());
        this.transcribeClient?.destroy();
    }
}
