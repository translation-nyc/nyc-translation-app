import {comprehend} from "./comprehend";
import {translate} from "./translation";
import type {Phrase, TranscriptPart} from "../../amplify/utils/types.ts";

export async function detectAmbiguity(transcript: TranscriptPart[]): Promise<Phrase[]> {
    const ambiguousWords: Phrase[] = [];
    for (const part of transcript) {
        const translateKP = await comprehend(
            part.translatedText,
            part.translatedLanguage.translateCode,
        );
        const translateKPSet = [];
        for (const phrase of translateKP) {
            const text = phrase.Text;
            if (text === undefined) {
                continue;
            }
            translateKPSet.push(phrase.Text!.toLowerCase());
        }

        for (const phrase of translateKP) {
            const text = phrase.Text;
            const beginOffset = phrase.BeginOffset;
            const endOffset = phrase.EndOffset;
            if (text === undefined || beginOffset === undefined || endOffset === undefined) {
                continue;
            }
            const backOriginalPhrase = await translate(
                text,
                part.translatedLanguage.translateCode,
                part.language.translateCode,
            );
            const backTranslatedPhrase = await translate(
                backOriginalPhrase,
                part.language.translateCode,
                part.translatedLanguage.translateCode,
            );
            if (!translateKPSet.includes(backTranslatedPhrase.toLowerCase())) {
                const ambiguousWord: Phrase = {
                    text: text,
                    beginOffset: beginOffset,
                    endOffset: endOffset,
                    alternateDefinition: backTranslatedPhrase,
                };
                let exists = false;
                for (const amb of ambiguousWords) {
                    if (amb.text === ambiguousWord.text && amb.beginOffset === ambiguousWord.beginOffset) {
                        exists = true;
                    }
                }
                if (!exists) {
                    ambiguousWords.push(ambiguousWord);
                }
            }
        }
    }
    return ambiguousWords;
}
