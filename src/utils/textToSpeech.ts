import {Predictions} from "@aws-amplify/predictions";

export const textToSpeech = async function (text: string): Promise<void> {
    const speech = await Predictions.convert({
        textToSpeech: {
            source: {
                text: text,
            },
            voiceId: "Emma"
        }
    });
    const audioStream = speech.audioStream
    const audioBlob = new Blob([audioStream], { type : 'audio/mp3'})
    const audioURL = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioURL);
    audio.play();
}
