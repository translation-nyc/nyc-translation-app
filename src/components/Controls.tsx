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
    const [isChecked, setIsChecked] = useState(false);
    const {tokens} = useTheme();

    return (
        <div className="w-full md:w-72 p-6 bg-white rounded-lg shadow-lg"> {/* Container for controls*/}
            <div className="space-y-6">
                <div className="flex justify-center"> {/* Container for start/stop button*/}
                    <Button
                        className={`start-stop-button ${props.isTranslating ? "stop-button" : "start-button"}`}
                        disabled={props.isLoading}
                        isFullWidth={true}
                        onClick={props.onToggleTranslation}
                    >
                        {props.isLoading ? (
                            "Loading..."
                        ) : (
                            props.isTranslating ? (
                                <>
                                    <StopIcon className="mr-2 h-5 w-5"/>
                                    Stop Translation
                                </>
                            ) : (
                                <>
                                    <PlayIcon className="mr-2 h-5 w-5"/>
                                    Start Translation
                                </>
                            )
                        )}
                    </Button>
                </div>

                <div className="space-y-2"> {/* Container for target language controls*/}
                    <div>
                        <Heading>
                            Target Language
                        </Heading>
                    </div>

                    <select
                        onChange={e => props.onChangeTargetLanguage(Languages[parseInt(e.target.value)])}
                        defaultValue="default"
                        className="border border-gray-400 w-full rounded p-2"
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

                <div>
                    <Button
                        variation="primary"
                        onClick={() => textToSpeech(props.transcript)}
                    >
                        Play Transcription
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Controls;
