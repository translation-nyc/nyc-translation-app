class PcmProcessor extends AudioWorkletProcessor {

    // noinspection JSUnusedGlobalSymbols
    /**
     * Processes the audio data.
     *
     * @param inputs {Float32Array[][]}
     * @returns {boolean}
     */
    process(inputs) {
        if (inputs[0].length > 0) {
            const float32Data = inputs[0][0];
            const uint8Buffer = float32ToUInt8Pcm(float32Data);
            this.port.postMessage(uint8Buffer);
        }
        return true;
    }
}

/**
 * Converts Float32 PCM data to a Uint8 buffer.
 *
 * @param input {Float32Array}
 * @returns {ArrayBuffer}
 */
function float32ToUInt8Pcm(input) {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
        const sample = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(i * 2, sample * 32767, true);
    }
    return output.buffer;
}

registerProcessor("pcm-processor", PcmProcessor);
