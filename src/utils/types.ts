import type {LanguageCode} from "@aws-sdk/client-transcribe-streaming";
import type {VoiceId} from "@aws-sdk/client-polly";
import {Phrase} from "./ambiguity-detection.ts";

export interface Language {
    name: string;
    transcribeCode: LanguageCode;
    translateCode: string;
    ttsVoices: TtsVoice[];
}

export interface TtsVoice {
    id: VoiceId;
    name?: string;
}

export interface TranscriptPart {
    text: string;
    language: Language;
    lastResultId: string;
    lastCompleteIndex: number;
    translatedText: string;
    translatedLanguage: Language;
    ambiguousWords: Phrase[];
    lastCompleteTranslatedIndex: number;
}

export interface Transcript {
    parts: TranscriptPart[];
    lastLanguageCode: LanguageCode;
    lastTargetLanguageCode: LanguageCode | null;
}
