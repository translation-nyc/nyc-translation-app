import {LanguageCode} from "@aws-sdk/client-transcribe-streaming";
import {VoiceId} from "@aws-sdk/client-polly";
import type {Language} from "./types.ts";

// noinspection JSUnusedGlobalSymbols
export class Languages {

    static ALL: Language[] = [];
    private static allByCode: Record<string, Language> = {};

    static get(code: string): Language {
        const language = this.allByCode[code];
        if (language === undefined) {
            throw new Error(`Language not found: ${code}`);
        } else {
            return language;
        }
    }

    private static register(language: Language) {
        this.ALL.push(language);
        this.allByCode[language.transcribeCode] = language;
        this.allByCode[language.translateCode] = language;
        return language;
    }

    static readonly ARABIC: Language = this.register({
        name: "Arabic",
        transcribeCode: LanguageCode.AR_SA,
        translateCode: "ar",
        ttsVoices: [
            {
                id: VoiceId.Zeina,
            },
        ],
    });

    static readonly CHINESE: Language = this.register({
        name: "Chinese",
        transcribeCode: LanguageCode.ZH_CN,
        translateCode: "zh",
        ttsVoices: [
            {
                id: VoiceId.Zhiyu,
            },
        ],
    });

    static readonly ENGLISH: Language = this.register({
        name: "English",
        transcribeCode: LanguageCode.EN_GB,
        translateCode: "en",
        ttsVoices: [
            {
                id: VoiceId.Amy,
            },
            {
                id: VoiceId.Emma,
            },
            {
                id: VoiceId.Brian,
            },
        ],
    });

    static readonly FRENCH: Language = this.register({
        name: "French",
        transcribeCode: LanguageCode.FR_FR,
        translateCode: "fr",
        ttsVoices: [
            {
                id: VoiceId.Celine,
                name: "Céline",
            },
            {
                id: VoiceId.Lea,
                name: "Léa",
            },
            {
                id: VoiceId.Mathieu,
            },
        ],
    });

    static readonly SPANISH: Language = this.register({
        name: "Spanish",
        transcribeCode: LanguageCode.ES_ES,
        translateCode: "es",
        ttsVoices: [
            {
                id: VoiceId.Conchita,
            },
            {
                id: VoiceId.Lucia,
            },
            {
                id: VoiceId.Enrique,
            },
        ],
    });
}
