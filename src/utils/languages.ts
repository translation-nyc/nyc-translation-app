import {LanguageCode} from "@aws-sdk/client-transcribe-streaming";
import {Language} from "./types.ts";

export const Languages: Language[] = [
    {code: LanguageCode.EN_GB, name: "English"},
    {code: LanguageCode.FR_FR, name: "French"},
    {code: LanguageCode.ES_ES, name: "Spanish"},
    {code: LanguageCode.AR_SA, name: "Arabic"},
    {code: LanguageCode.ZH_CN, name: "Chinese"},
];

export function getLanguage(code: LanguageCode): Language {
    const language = Languages.find(language => language.code === code);
    if (language === undefined) {
        throw new Error(`Language not found: ${code}`);
    } else {
        return language;
    }
}
