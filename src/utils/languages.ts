import {LanguageCode} from "@aws-sdk/client-transcribe-streaming";
import {VoiceId} from "@aws-sdk/client-polly";
import type {Language} from "./types.ts";

// noinspection JSUnusedGlobalSymbols
export class Languages {

    static readonly ALL: Language[] = [];
    private static readonly allByCode: Record<string, Language> = {};

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

    static readonly DANISH: Language = this.register({
        name: "Danish",
        transcribeCode: LanguageCode.DA_DK,
        translateCode: "da",
        ttsVoices: [
            {
                id: VoiceId.Naja,
            },
            {
                id: VoiceId.Mads,
            },
        ],
    });

    static readonly DUTCH: Language = this.register({
        name: "Dutch",
        transcribeCode: LanguageCode.NL_NL,
        translateCode: "nl",
        ttsVoices: [
            {
                id: VoiceId.Lotte,
            },
            {
                id: VoiceId.Ruben,
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

    static readonly GERMAN: Language = this.register({
        name: "German",
        transcribeCode: LanguageCode.DE_DE,
        translateCode: "de",
        ttsVoices: [
            {
                id: VoiceId.Marlene,
            },
            {
                id: VoiceId.Vicki,
            },
            {
                id: VoiceId.Hans,
            },
        ],
    });

    static readonly HINDI: Language = this.register({
        name: "Hindi",
        transcribeCode: LanguageCode.HI_IN,
        translateCode: "hi",
        ttsVoices: [
            {
                id: VoiceId.Aditi,
            },
        ],
    });

    static readonly ITALIAN: Language = this.register({
        name: "Italian",
        transcribeCode: LanguageCode.IT_IT,
        translateCode: "it",
        ttsVoices: [
            {
                id: VoiceId.Carla,
            },
            {
                id: VoiceId.Bianca,
            },
            {
                id: VoiceId.Giorgio,
            },
        ],
    });

    static readonly JAPANESE: Language = this.register({
        name: "Japanese",
        transcribeCode: LanguageCode.JA_JP,
        translateCode: "ja",
        ttsVoices: [
            {
                id: VoiceId.Mizuki,
            },
            {
                id: VoiceId.Takumi,
            },
        ],
    });

    static readonly KOREAN: Language = this.register({
        name: "Korean",
        transcribeCode: LanguageCode.KO_KR,
        translateCode: "ko",
        ttsVoices: [
            {
                id: VoiceId.Seoyeon,
            },
        ],
    });

    static readonly NORWEGIAN: Language = this.register({
        name: "Norwegian",
        transcribeCode: LanguageCode.NO_NO,
        translateCode: "no",
        ttsVoices: [
            {
                id: VoiceId.Liv,
            },
        ],
    });

    static readonly POLISH: Language = this.register({
        name: "Polish",
        transcribeCode: LanguageCode.PL_PL,
        translateCode: "pl",
        ttsVoices: [
            {
                id: VoiceId.Ewa,
            },
            {
                id: VoiceId.Maja,
            },
            {
                id: VoiceId.Jacek,
            },
            {
                id: VoiceId.Jan,
            },
        ],
    });

    static readonly PORTUGUESE: Language = this.register({
        name: "Portuguese",
        transcribeCode: LanguageCode.PT_PT,
        translateCode: "pt-PT",
        ttsVoices: [
            {
                id: VoiceId.Ines,
                name: "Inês",
            },
        ],
    });

    static readonly ROMANIAN: Language = this.register({
        name: "Romanian",
        transcribeCode: LanguageCode.RO_RO,
        translateCode: "ro",
        ttsVoices: [
            {
                id: VoiceId.Carmen,
            },
        ],
    });

    static readonly RUSSIAN: Language = this.register({
        name: "Russian",
        transcribeCode: LanguageCode.RU_RU,
        translateCode: "ru",
        ttsVoices: [
            {
                id: VoiceId.Tatyana,
            },
            {
                id: VoiceId.Maxim,
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

    static readonly SWEDISH: Language = this.register({
        name: "Swedish",
        transcribeCode: LanguageCode.SV_SE,
        translateCode: "sv",
        ttsVoices: [
            {
                id: VoiceId.Astrid,
            },
        ],
    });
}
