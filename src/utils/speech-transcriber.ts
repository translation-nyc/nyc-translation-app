import {
    type AudioStream,
    BadRequestException,
    LanguageCode,
    MediaEncoding,
    StartStreamTranscriptionCommand,
    TranscribeStreamingClient,
    type TranscriptResultStream,
} from "@aws-sdk/client-transcribe-streaming";
import {
    StartStreamTranscriptionCommandInput,
} from "@aws-sdk/client-transcribe-streaming/dist-types/commands/StartStreamTranscriptionCommand";
import {AsyncBlockingQueue} from "./async-blocking-queue.ts";
import pcmProcessorUrl from "./pcm-processor.ts?worker&url";

const TARGET_SAMPLE_RATE = 16000;

export class SpeechTranscriber {

    public language: LanguageCode | undefined;

    private readonly transcribeClient: TranscribeStreamingClient;
    private readonly onTranscription: (event: TranscriptResultStream) => void;

    private audioContext: AudioContext | undefined;
    private audioWorkletNode: AudioWorkletNode | undefined;
    private mediaStream: MediaStream | undefined;
    private audioSource: MediaStreamAudioSourceNode | undefined;

    private stopped: boolean = false;

    constructor(client: TranscribeStreamingClient, onTranscription: (event: TranscriptResultStream) => void) {
        this.transcribeClient = client;
        this.onTranscription = onTranscription;
    }

    async start() {
        if (this.language === undefined) {
            throw new Error("Language is not set");
        }

        this.stopped = false;
        this.audioContext = new AudioContext();
        const audioQueue = new AsyncBlockingQueue<ArrayBuffer>();

        const audioWorkletSetup = this.audioContext.audioWorklet.addModule(pcmProcessorUrl);

        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
            },
        });

        await audioWorkletSetup;
        this.audioWorkletNode = new AudioWorkletNode(this.audioContext, "pcm-processor");
        this.audioWorkletNode.port.postMessage(TARGET_SAMPLE_RATE);
        this.audioWorkletNode.port.onmessage = event => {
            audioQueue.enqueue(event.data);
        };

        this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.audioSource.connect(this.audioWorkletNode);

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const params: StartStreamTranscriptionCommandInput = {
            LanguageCode: LanguageCode.EN_GB,
            MediaEncoding: MediaEncoding.PCM,
            MediaSampleRateHertz: Math.min(this.audioContext.sampleRate, TARGET_SAMPLE_RATE),
            AudioStream: (async function* (): AsyncGenerator<AudioStream.AudioEventMember> {
                for await (const data of audioQueue) {
                    yield {
                        AudioEvent: {
                            AudioChunk: new Uint8Array(data),
                        },
                    };
                    if (self.stopped) break;
                }
            })(),
        };

        const command = new StartStreamTranscriptionCommand(params);
        while (!this.stopped) {
            try {
                const response = await this.transcribeClient.send(command);
                for await (const event of response.TranscriptResultStream!) {
                    this.onTranscription(event);
                    if (this.stopped) break;
                }
            } catch (e) {
                if (!(e instanceof BadRequestException)) {
                    console.error(e);
                }
            }
        }
    }

    async stop() {
        this.stopped = true;
        this.audioWorkletNode?.disconnect();
        this.audioSource?.disconnect();
        await this.audioContext?.close();
        this.mediaStream?.getTracks().forEach(track => track.stop());
    }
}
