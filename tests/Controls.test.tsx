import {describe, expect, test, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Language, Transcript, TtsVoice} from "../amplify/utils/types";
import {Languages} from "../amplify/utils/languages";
import Controls from "../src/components/Controls";
import {VoiceId} from "@aws-sdk/client-polly";

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

const emptyTranscript: Transcript = {
    parts: [],
    lastLanguageCode: Languages.ENGLISH.transcribeCode,
    lastTargetLanguageCode: null,
};

const selectedVoices: Record<string, TtsVoice> = Languages.ALL.reduce(
    (accumulator, language) => ({...accumulator, [language.name]: language.ttsVoices[0]}),
    {},
);

describe("Controls", () => {
    describe("Toggle translation button", () => {
        test("Button text", () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={null}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            const button = screen.getByRole("button", {
                name: "Toggle translation button",
            });

            expect(button.innerHTML).toBe("Select a language");
        });

        test("Button enabled", () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={Languages.FRENCH}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            const button = screen.getByRole("button", {
                name: "Toggle translation button",
            });

            expect(button.hasAttribute("disabled")).toBe(false);
        });

        test("Logged out button", () => {
            render(
                <Controls
                    isLoggedIn={false}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={null}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            const button = screen.getByRole("button", {
                name: "Toggle translation button",
            });

            expect(button.innerHTML).toBe("Please login");
            expect(button.hasAttribute("disabled")).toBe(true);
        });

        test("Press button", async () => {
            let isTranslating = false;
            const toggleTranslation = vi.fn(() => isTranslating = !isTranslating);

            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={toggleTranslation}
                    targetLanguage={Languages.FRENCH}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            expect(isTranslating).toBe(false);
            expect(toggleTranslation).not.toHaveBeenCalled();

            const button = screen.getByRole("button", {
                name: "Toggle translation button",
            });

            await userEvent.click(button);

            expect(isTranslating).toBe(true);
            expect(toggleTranslation).toHaveBeenCalled();
        });
    });

    describe("Language selector", () => {
        test("Language options", async () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={null}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            const selector = screen.getByRole("combobox", {
                name: "Select language",
            }) as HTMLSelectElement;

            expect(selector.options.length).toBe(Languages.ALL.length);
            expect(selector.selectedOptions.length === 1);

            const selectedOption = selector.selectedOptions[0];
            expect(selectedOption.selected).toBe(true);
            expect(selectedOption.innerHTML).toBe("Select a language");

            const options = Array.from(selector.options).map(option => option.innerHTML);
            options.shift();
            const languagesNoEnglish = Languages.ALL
                .filter(language => language !== Languages.ENGLISH)
                .map(language => language.name);
            expect(options).toStrictEqual(languagesNoEnglish);
        });

        test("Select language", async () => {
            let selectedLanguage: Language | null = null;
            const changeLanguage = vi.fn((language: Language) => selectedLanguage = language);

            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={null}
                    onChangeTargetLanguage={changeLanguage}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            expect(changeLanguage).not.toHaveBeenCalled();
            expect(selectedLanguage).toBeNull();

            const selector = screen.getByRole("combobox", {
                name: "Select language",
            }) as HTMLSelectElement;

            await userEvent.selectOptions(selector, Languages.FRENCH.name);

            expect(changeLanguage).toHaveBeenCalled();
            expect(selectedLanguage).toBe(Languages.FRENCH);

            expect(selector.selectedOptions.length === 1);

            const selectedOption = selector.selectedOptions[0];
            expect(selectedOption.selected).toBe(true);
            expect(selectedOption.innerHTML).toBe(Languages.FRENCH.name);
        });

        test("No selected language status", async () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={null}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            const selectedLanguageStatus = screen.getByRole("paragraph", {
                name: "Selected language status",
            });

            expect(selectedLanguageStatus.innerHTML).toBe("The currently selected language is: none");
        });

        test("Selected language status", async () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={Languages.FRENCH}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            const selectedLanguageStatus = screen.getByRole("paragraph", {
                name: "Selected language status",
            });

            expect(selectedLanguageStatus.innerHTML).toBe(`The currently selected language is: ${Languages.FRENCH.name}`);
        });
    });

    describe("Voice selector", () => {
        test("Voice options", async () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={Languages.FRENCH}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            const selector = screen.getByRole("combobox", {
                name: "Select voice",
            }) as HTMLSelectElement;

            expect(selector.options.length).toBe(Languages.FRENCH.ttsVoices.length);
            expect(selector.selectedOptions.length === 1);

            const selectedOption = selector.selectedOptions[0];
            expect(selectedOption.selected).toBe(true);

            const expectedVoice = Languages.FRENCH.ttsVoices[0];
            expect(selectedOption.innerHTML).toBe(expectedVoice.name ?? expectedVoice.id);

            const options = Array.from(selector.options).map(option => option.innerHTML);
            const expectedVoices = Languages.FRENCH.ttsVoices.map(voice => voice.name ?? voice.id);
            expect(options).toStrictEqual(expectedVoices);
        });

        test("Select voice", async () => {
            const defaultVoice = Languages.FRENCH.ttsVoices[0];
            const targetVoice = Languages.FRENCH.ttsVoices[1];

            let defaultVoiceId = defaultVoice.id;
            const changeVoice = vi.fn((voice: VoiceId) => defaultVoiceId = voice);

            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={Languages.FRENCH}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={changeVoice}
                    transcript={transcript}
                />
            );

            expect(changeVoice).not.toHaveBeenCalled();
            expect(defaultVoiceId).toBe(defaultVoice.id);

            const selector = screen.getByRole("combobox", {
                name: "Select voice",
            }) as HTMLSelectElement;

            await userEvent.selectOptions(selector, targetVoice.id);

            expect(changeVoice).toHaveBeenCalled();
            expect(defaultVoiceId).toBe(targetVoice.id);
        });

        test("Selected voice status", async () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={Languages.FRENCH}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            const selectedLanguageStatus = screen.getByRole("paragraph", {
                name: "Selected voice status",
            });

            const selectedVoice = Languages.FRENCH.ttsVoices[0];

            expect(selectedLanguageStatus.innerHTML).toBe(`The currently selected voice is: ${selectedVoice.name ?? selectedVoice.id}`);
        });
    });

    describe("Review button", () => {
        test("Button text", () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={null}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                    fonts={{}}
                />
            );

            const button = screen.getByRole("button", {
                name: "Review button",
            });

            expect(button.innerHTML).toBe("Review");
        });

        test("Loading button", () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={null}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                />
            );

            const button = screen.getByRole("button", {
                name: "Review button",
            });

            expect(button.innerHTML).toBe("Loading...");
            expect(button.hasAttribute("disabled")).toBe(true);
        });

        test("Disabled button", () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={null}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={emptyTranscript}
                    fonts={{}}
                />
            );

            const button = screen.getByRole("button", {
                name: "Review button",
            });

            expect(button.hasAttribute("disabled")).toBe(true);
        });

        test("Open review modal", async () => {
            render(
                <Controls
                    isLoggedIn={true}
                    isLoading={false}
                    isTranslating={false}
                    onToggleTranslation={() => undefined}
                    targetLanguage={null}
                    onChangeTargetLanguage={() => undefined}
                    selectedVoices={selectedVoices}
                    onChangeVoice={() => undefined}
                    transcript={transcript}
                    fonts={{}}
                />
            );

            const button = screen.getByRole("button", {
                name: "Review button",
            });

            await userEvent.click(button);

            const header = screen.getByRole("heading", {
                name: "Review transcript header",
            });

            expect(header.innerHTML).toBe("Review transcript and click to add comments");
        });
    });
});
