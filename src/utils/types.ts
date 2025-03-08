import {LanguageCode} from "@aws-sdk/client-transcribe-streaming";

export interface Language {
    name: string;
    transcribeCode: LanguageCode;
    translateCode: string;
}

export interface TranscriptPart {
    text: string;
    language: Language;
    lastResultId: string;
    lastCompleteIndex: number;
    translatedText: string;
    translatedLanguage: Language;
    lastCompleteTranslatedIndex: number;
}

export interface Transcript {
    parts: TranscriptPart[];
    lastLanguageCode: LanguageCode;
}
