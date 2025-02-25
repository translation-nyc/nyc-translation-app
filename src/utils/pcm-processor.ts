const VOLUME_THRESHOLD = 0.01;
const MAX_SILENCE_DURATION_SECONDS = 2;

class PcmProcessor extends AudioWorkletProcessor {

    private silenceCountDown = 0;

    // noinspection JSUnusedGlobalSymbols
    process(inputs: Float32Array[][]): boolean {
        if (inputs[0].length > 0) {
            const float32Data = inputs[0][0];
            const volume = calculateRootMeanSquare(float32Data);
            if (volume >= VOLUME_THRESHOLD) {
                const uint8Buffer = float32ToUint8Pcm(float32Data);
                this.port.postMessage(uint8Buffer);
                this.silenceCountDown = MAX_SILENCE_DURATION_SECONDS;
            } else if (this.silenceCountDown > 0) {
                const uint8Buffer = float32ToUint8Pcm(float32Data);
                this.port.postMessage(uint8Buffer);
                const samples = float32Data.length;
                this.silenceCountDown -= calculateChunkDuration(samples, sampleRate);
                this.silenceCountDown = Math.max(0, this.silenceCountDown);
            }
        }
        return true;
    }
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
