import {Predictions} from "@aws-amplify/predictions";
import type {VoiceId} from "@aws-sdk/client-polly";

export async function textToSpeech(text: string, voice: VoiceId) {
    const speech = await Predictions.convert({
        textToSpeech: {
            source: {
                text: text,
            },
            voiceId: voice,
        },
    });
    const audioStream = speech.audioStream;
    const audioBlob = new Blob([audioStream], {
        type: "audio/mp3",
    });
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    const finished = new Promise<void>(resolve => {
        audio.onended = () => resolve();
    });
    await audio.play();
    return finished;
}
