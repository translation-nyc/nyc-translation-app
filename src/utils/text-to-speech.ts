import {Predictions} from "@aws-amplify/predictions";
import type {VoiceId} from "@aws-sdk/client-polly";

// Possible extension by adding an option to select different voice options
// Each language has different option for male or female voices
export async function textToSpeech(text: string, voice: VoiceId): Promise<void> {
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
        type : "audio/mp3",
    });
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    await audio.play();
}
