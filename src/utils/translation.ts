import {Predictions} from "@aws-amplify/predictions";

export async function translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    const result = await Predictions.convert({
        translateText: {
            source: {
                text: text,
                language: sourceLanguage,
            },
            targetLanguage: targetLanguage,
        },
    });
    return result.text;
}
