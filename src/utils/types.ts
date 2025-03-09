import type {LanguageCode} from "@aws-sdk/client-transcribe-streaming";
import type {VoiceId} from "@aws-sdk/client-polly";

export interface Language {
    name: string;
    transcribeCode: LanguageCode;
    translateCode: string;
    ttsVoice: VoiceId;
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
