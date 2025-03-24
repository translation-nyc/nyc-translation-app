import {describe, expect, test} from "vitest";
import {render, screen} from "@testing-library/react";
import {Transcript, TtsVoice} from "../amplify/utils/types";
import {Languages} from "../amplify/utils/languages";
import TranscriptBox from "../src/components/TranscriptBox";
import {PopupProvider} from "../src/components/Popup";

const transcript: Transcript = {
    parts: [
        {
            text: "Hello, what's your name?",
            language: Languages.ENGLISH,
            lastResultId: "",
            lastCompleteIndex: 0,
            translatedText: "Bonjour, comment t'appelles-tu ?",
            translatedLanguage: Languages.FRENCH,
            lastCompleteTranslatedIndex: 0,
            ambiguousWords: [],
        },
    ],
    lastLanguageCode: Languages.ENGLISH.transcribeCode,
    lastTargetLanguageCode: Languages.FRENCH.transcribeCode,
};

const selectedVoices: Record<string, TtsVoice> = Languages.ALL.reduce(
    (accumulator, language) => ({...accumulator, [language.name]: language.ttsVoices[0]}),
    {},
);

describe("TranscriptBox", () => {
    test("Has content", () => {
        render(
            <PopupProvider>
                <TranscriptBox
                    transcript={transcript}
                    isTranslating={false}
                    selectedVoices={selectedVoices}
                    ttsPlaying={false}
                    onTtsPlaying={() => undefined}
                />
            </PopupProvider>
        );

        const paragraph = screen.getByRole("paragraph", {
            name: "Transcript part 1",
        });

        expect(paragraph.innerHTML).toBe(transcript.parts[0].text);

        const translatedParagraph = screen.getByRole("textbox", {
            name: "Translated transcript part 1",
        });

        expect(translatedParagraph.innerHTML).toBe(transcript.parts[0].translatedText);
    });
});
