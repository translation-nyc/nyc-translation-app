import {LanguageCode} from "@aws-sdk/client-transcribe-streaming";

export interface Language {
    code: LanguageCode;
    name: string;
}

export interface TranscriptPart {
    text: string;
    language: Language;
    resultId: string;
    lastCompleteIndex: number;
}

export interface Transcript {
    parts: TranscriptPart[];
    lastLanguageCode: LanguageCode;
}
