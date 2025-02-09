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

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(this.mediaStream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        const audioQueue = new AsyncBlockingQueue<Float32Array>();

        processor.onaudioprocess = (event) => {
            const data = event.inputBuffer.getChannelData(0);
            audioQueue.enqueue(data);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

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
            MediaSampleRateHertz: audioContext.sampleRate,
            AudioStream: (async function* (): AsyncGenerator<AudioStream.AudioEventMember> {
                for await (const data of audioQueue) {
                    const pcmData = float32ToUInt8Pcm(data);
                    yield {
                        AudioEvent: {
                            AudioChunk: pcmData,
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

function float32ToUInt8Pcm(input: Float32Array): Uint8Array {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
        const sample = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(i * 2, sample * 32767, true);
    }
    return new Uint8Array(output.buffer);
}
