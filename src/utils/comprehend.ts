import {Amplify, fetchAuthSession} from "@aws-amplify/core";
import {Comprehend, type KeyPhrase, LanguageCode} from "@aws-sdk/client-comprehend";
import type {ComprehendClientConfig} from "@aws-sdk/client-comprehend/dist-types/ComprehendClient";

/**
 * Detect key phrases in the given text using Lambda function
 * @param text - Input text to analyze
 * @param languageCode - Language code for the text
 * @returns Promise resolving to an array of key phrases
 */
export async function comprehend(text: string, languageCode: string): Promise<KeyPhrase[]> {
    if (text.trim().length === 0
        || Object.values(LanguageCode).indexOf(languageCode as LanguageCode) === -1
    ) {
        return [];
    }
    const region = Amplify.getConfig()
        .Predictions!
        .interpret!
        .interpretText!
        .region!;
    const authSession = await fetchAuthSession();
    const credentials = authSession.credentials!;
    const config: ComprehendClientConfig = {
        region,
        credentials,
    };
    const comprehend = new Comprehend(config);
    const response = await comprehend.detectKeyPhrases({
        Text: text,
        LanguageCode: languageCode as LanguageCode,
    });
    return response.KeyPhrases ?? [];
}
