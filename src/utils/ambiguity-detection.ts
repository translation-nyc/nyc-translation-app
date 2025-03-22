import {comprehend} from "./comprehend";
import {translate} from "./translation";
import type {Phrase, TranscriptPart} from "../../amplify/utils/types.ts";

export const detectAmbiguity = async (transcript: TranscriptPart[]) => {
    const ambiguousWords: Phrase[] = [];
    for (const part of transcript) {
        const translateKP = await comprehend("comprehendKeyPhrases", part.translatedText, part.translatedLanguage.translateCode);
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
                    beginOffset: tPhrase.BeginOffset,
                    endOffset: tPhrase.EndOffset,
                    alternateDefinition: backTranslatedPhrase
                };
                let exists = false;
                for (const amb of ambiguousWords) {
                    if(amb.text === ambiguousWord.text && amb.beginOffset === ambiguousWord.beginOffset) {
                        exists = true;
                    }
                }
                if (!exists){
                    ambiguousWords.push(ambiguousWord);
                }
            }
        }
    }
    return ambiguousWords;

};
