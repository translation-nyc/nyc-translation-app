import { comprehend } from "./comprehend";
import { translate } from "./translation";
import { TranscriptPart } from "./types";

export interface Phrase {
    text: string,
    offset: number,
    alternateDefintion: string
}


export const detectAmbiguity = async (transcript: TranscriptPart[]) => {
    const ambiguousWords: Phrase[] = [];
    for (const part of transcript) {
        const translateKP = await comprehend('comprehendKeyPhrases', part.translatedText, part.translatedLanguage.translateCode);
        const translateKPSet = [];
        for (const phrase of translateKP) {
            translateKPSet.push(phrase.Text.toLowerCase());
        }

        for (const tPhrase of translateKP) {
            const phrase = tPhrase.Text;
            const backOrignalPhrase = await translate(phrase, part.translatedLanguage.translateCode, part.language.translateCode);
            const backTranslatedPhrase = await translate(backOrignalPhrase, part.language.translateCode, part.translatedLanguage.translateCode);
            if (!translateKPSet.includes(backTranslatedPhrase.toLowerCase())) {
                const ambiguousWord: Phrase = {
                    text: phrase,
                    offset: tPhrase.BeginOffset,
                    alternateDefintion: backTranslatedPhrase
                };
                let exists = false;
                for (const amb of ambiguousWords) {
                    if(amb.text === ambiguousWord.text && amb.offset === ambiguousWord.offset) {
                        exists = true;
                    }
                }
                if (!exists){
                    ambiguousWords.push(ambiguousWord);
                }
            }
        }
    }
    console.log(ambiguousWords);
    return ambiguousWords;

};
