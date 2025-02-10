class PcmProcessor extends AudioWorkletProcessor {

    // noinspection JSUnusedGlobalSymbols
    process(inputs: Float32Array[][]): boolean {
        if (inputs[0].length > 0) {
            const float32Data = inputs[0][0];
            const uint8Buffer = float32ToUint8Pcm(float32Data);
            this.port.postMessage(uint8Buffer);
        }
        return true;
    }
}

function float32ToUint8Pcm(input: Float32Array): ArrayBuffer {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
        const sample = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(i * 2, sample * 32767, true);
    }
    return output.buffer;
}

registerProcessor("pcm-processor", PcmProcessor);
