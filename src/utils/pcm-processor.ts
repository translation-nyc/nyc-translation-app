const VOLUME_THRESHOLD = 0.01;
const MAX_SILENCE_DURATION_SECONDS = 2;

class PcmProcessor extends AudioWorkletProcessor {

    private targetSampleRate = 0;
    private silenceCountDown = 0;

    constructor() {
        super();
        this.port.onmessage = this.handleMessage.bind(this);
    }

    handleMessage(event: MessageEvent) {
        this.targetSampleRate = event.data;
    }

    // noinspection JSUnusedGlobalSymbols
    process(inputs: Float32Array[][]): boolean {
        if (this.targetSampleRate >= 0 && inputs[0].length > 0) {
            const float32Data = inputs[0][0];
            const downSampled = downSampleBuffer(float32Data, sampleRate, this.targetSampleRate);
            const volume = calculateRootMeanSquare(downSampled);
            if (volume >= VOLUME_THRESHOLD) {
                const uint8Buffer = float32ToUint8Pcm(downSampled);
                this.port.postMessage(uint8Buffer);
                this.silenceCountDown = MAX_SILENCE_DURATION_SECONDS;
            } else if (this.silenceCountDown > 0) {
                const uint8Buffer = float32ToUint8Pcm(downSampled);
                this.port.postMessage(uint8Buffer);
                const samples = downSampled.length;
                this.silenceCountDown -= calculateChunkDuration(samples, this.targetSampleRate);
                this.silenceCountDown = Math.max(0, this.silenceCountDown);
            }
        }
        return true;
    }
}

function downSampleBuffer(buffer: Float32Array, originalSampleRate: number, targetSampleRate: number): Float32Array {
    if (targetSampleRate == originalSampleRate) {
        return buffer;
    }
    if (targetSampleRate > originalSampleRate) {
        throw new Error("Target sample rate should be less than original sample rate");
    }
    const sampleRateRatio = originalSampleRate / targetSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        // Use average value of skipped samples
        let accumulator = 0;
        let count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accumulator += buffer[i];
            count++;
        }
        result[offsetResult] = accumulator / count;
        // Or you can simply get rid of the skipped samples:
        // result[offsetResult] = buffer[nextOffsetBuffer];
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}

function calculateRootMeanSquare(input: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
        sum += input[i] * input[i];
    }
    return Math.sqrt(sum / input.length);
}

function float32ToUint8Pcm(input: Float32Array): ArrayBuffer {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
        const sample = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(i * 2, sample * 32767, true);
    }
    return output.buffer;
}

function calculateChunkDuration(samples: number, sampleRate: number): number {
    return samples / sampleRate;
}

registerProcessor("pcm-processor", PcmProcessor);
