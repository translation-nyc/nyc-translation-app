import {LanguageCode} from "@aws-sdk/client-transcribe-streaming";

export interface Language {
    code: LanguageCode;
    name: string;
}

export const Languages: Language[] = [
    { code: LanguageCode.FR_FR, name: "French" },
    { code: LanguageCode.ES_ES, name: "Spanish" },
    { code: LanguageCode.AR_SA, name: "Arabic" },
    { code: LanguageCode.ZH_CN, name: "Chinese" },
];
