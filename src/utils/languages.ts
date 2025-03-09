import {LanguageCode} from "@aws-sdk/client-transcribe-streaming";
import {VoiceId} from "@aws-sdk/client-polly";
import type {Language} from "./types.ts";

export const ENGLISH: Language = {
    name: "English",
    transcribeCode: LanguageCode.EN_GB,
    translateCode: "en",
    ttsVoice: VoiceId.Emma,
};

export const Languages: Language[] = [
    ENGLISH,
    {
        name: "French",
        transcribeCode: LanguageCode.FR_FR,
        translateCode: "fr",
        ttsVoice: VoiceId.Celine,
    },
    {
        name: "Spanish",
        transcribeCode: LanguageCode.ES_ES,
        translateCode: "es",
        ttsVoice: VoiceId.Lucia,
    },
    {
        name: "Arabic",
        transcribeCode: LanguageCode.AR_SA,
        translateCode: "ar",
        ttsVoice: VoiceId.Zeina,
    },
    {
        name: "Chinese",
        transcribeCode: LanguageCode.ZH_CN,
        translateCode: "zh",
        ttsVoice: VoiceId.Zhiyu,
    },
];

export function getLanguage(code: string): Language {
    const language = Languages.find(language =>
        language.transcribeCode === code || language.translateCode === code
    );
    if (language === undefined) {
        throw new Error(`Language not found: ${code}`);
    } else {
        return language;
    }
}
