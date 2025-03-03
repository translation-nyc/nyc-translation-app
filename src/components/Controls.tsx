import {useState} from "react";
import {Button, Heading, SwitchField, useTheme} from "@aws-amplify/ui-react";
import {PlayIcon, StopIcon} from "../assets/icons";
import "../styles/Controls.css";
import {textToSpeech} from "../utils/text-to-speech.ts";
import {Language, Languages} from "../utils/languages.ts";

interface ControlsProps {
    isLoading: boolean;
    isTranslating: boolean;
    onToggleTranslation: () => void;
    targetLanguage: Language | null;
    onChangeTargetLanguage: (language: Language) => void;
    transcript: string;
}

function Controls(props: ControlsProps) {
    return (
        <div className="w-full md:w-72 p-6 bg-white rounded-lg shadow-lg"> {/* Container for controls*/}
            <div className="space-y-6">
                <ToggleTranslationButton {...props}/>
                <LanguageSelector {...props}/>
                <AutoPunctuationSwitch/>
                <TextToSpeechButton {...props}/>
            </div>
        </div>
    );
}

function ToggleTranslationButton(props: ControlsProps) {
    return (
        <div className="flex justify-center">
            <Button
                className={`start-stop-button ${props.isTranslating ? "stop-button" : "start-button"}`}
                disabled={props.isLoading || props.targetLanguage === null}
                isFullWidth={true}
                onClick={props.onToggleTranslation}
            >
                {(() => {
                    if (props.isLoading) {
                        return "Loading...";
                    } else if (props.targetLanguage === null) {
                        return "Select a language";
                    } else if (props.isTranslating) {
                        return (
                            <>
                                <StopIcon className="mr-2 h-5 w-5"/>
                                Stop Translation
                            </>
                        );
                    } else {
                        return (
                            <>
                                <PlayIcon className="mr-2 h-5 w-5"/>
                                Start Translation
                            </>
                        );
                    }
                })()}
            </Button>
        </div>
    );
}

function LanguageSelector(props: ControlsProps) {
    return (
        <div className="space-y-2">
            <div>
                <Heading>
                    Target Language
                </Heading>
            </div>

            <select
                onChange={e => props.onChangeTargetLanguage(Languages[parseInt(e.target.value)])}
                defaultValue="default"
                disabled={props.isTranslating}
                className="border border-gray-400 w-full rounded p-2 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
            >
                <option disabled hidden value="default">
                    Select a language
                </option>
                {Languages.map((language, index) =>
                    <option key={index} value={index}>
                        {language.name}
                    </option>
                )}
            </select>

            <div>
                The currently selected language is: {props.targetLanguage?.name ?? "none"}
            </div>
        </div>
    );
}

function AutoPunctuationSwitch() {
    const [isChecked, setIsChecked] = useState(false);
    const {tokens} = useTheme();

    return (
        <div>
            <SwitchField
                isDisabled={false}
                isChecked={isChecked}
                label="Auto-punctuation"
                labelPosition="end"
                onChange={e => setIsChecked(e.target.checked)}
                trackCheckedColor={tokens.colors.blue[80]}
            />
        </div>
    );
}

function TextToSpeechButton(props: ControlsProps) {
    return (
        <div>
            <Button
                variation="primary"
                onClick={() => textToSpeech(props.transcript)}
            >
                Play Transcription
            </Button>
        </div>
    );
}

export default Controls;
