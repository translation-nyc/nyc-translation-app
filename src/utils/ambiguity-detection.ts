import { comprehend } from "./comprehend";
import { translate } from "./translation";
import { TranscriptPart } from "./types";

export interface Phrase {
    text: string,
    offset: number,
    alternateDefintion: string
}
const ambiguousWords: Phrase[] = [];

export const detectAmbiguity = async (transcript: TranscriptPart[]) => {
    for (const part of transcript) {
        const translateKP = await comprehend('comprehendKeyPhrases', part.translatedText, part.translatedLanguage.translateCode);
        const translateKPSet = [];
        for (const phrase of translateKP) {
            translateKPSet.push(phrase.text)
        }
        console.log(translateKPSet);

        for (const tPhrase of translateKP) {
            const phrase = tPhrase.text;
            const backOrignalPhrase = await translate(phrase, part.translatedLanguage.translateCode, part.language.translateCode);
            const backTranslatedPhrase = await translate(backOrignalPhrase, part.language.translateCode, part.translatedLanguage.translateCode);
            if (!translateKPSet.includes(backTranslatedPhrase)) {
                ambiguousWords.push({
                    text: phrase,
                    offset: tPhrase.beginOffset,
                    alternateDefintion: backTranslatedPhrase
                });
            }
        }
    }
    console.log(ambiguousWords);
    return ambiguousWords;

}

function split_at_index(value:string, index:number) {
    return value.substring(0, index) + "*" + value.substring(index);
}
