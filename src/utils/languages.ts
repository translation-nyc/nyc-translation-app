import {LanguageCode} from "@aws-sdk/client-transcribe-streaming";
import type {Language} from "./types.ts";

export const ENGLISH: Language = {
    name: "English",
    transcribeCode: LanguageCode.EN_GB,
    translateCode: "en",
};

export const Languages: Language[] = [
    ENGLISH,
    {
        name: "French",
        transcribeCode: LanguageCode.FR_FR,
        translateCode: "fr",
    },
    {
        name: "Spanish",
        transcribeCode: LanguageCode.ES_ES,
        translateCode: "es",
    },
    {
        name: "Arabic",
        transcribeCode: LanguageCode.AR_SA,
        translateCode: "ar",
    },
    {
        name: "Chinese",
        transcribeCode: LanguageCode.ZH_CN,
        translateCode: "zh",
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
