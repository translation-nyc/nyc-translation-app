import {useState} from "react";
import {Button, Heading, SelectField, SwitchField, useTheme} from "@aws-amplify/ui-react";
import {PlayIcon, StopIcon} from "../assets/icons";
import "../styles/Controls.css";

interface ControlsProps {
    isTranslating: boolean
    onToggleTranslation: () => void
}

function Controls({ isTranslating, onToggleTranslation }: ControlsProps) {
    const [targetLanguage, setTargetLanguage] = useState('')
    const [isChecked, setIsChecked] = useState(false)
    const { tokens } = useTheme();

    return (
        <div className="w-full md:w-72 p-6 bg-white rounded-lg shadow-lg"> {/* Container for controls*/}
            <div className="space-y-6">
                <div className="flex justify-center"> {/* Container for start/stop button*/}
                    <Button className={`start-stop-button ${isTranslating ? 'stop-button' : 'start-button'}`} isFullWidth={true} onClick={onToggleTranslation} >
                        {isTranslating ? (
                            <>
                                <StopIcon className="mr-2 h-5 w-5"/> Stop Translation
                            </>
                        ) : (
                            <>
                                <PlayIcon className="mr-2 h-5 w-5"/> Start Translation
                            </>
                        )}
                    </Button>
                </div>

                <div className="space-y-2"> {/* Container for target language controls*/}
                    <div>
                        <Heading>
                            Target Language
                        </Heading>
                    </div>

                    <div>
                        <SelectField
                            label="Fruit"
                            labelHidden
                            placeholder="Select a language"
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            options={['French', 'Spanish', 'Arabic', 'Chinese']}
                        >
                        </SelectField>
                    </div>

                    <div>The currently selected language is: {targetLanguage}</div>
                </div>

                <div>
                    <SwitchField
                        isDisabled={false}
                        isChecked={isChecked}
                        label="Auto-punctuation"
                        labelPosition="end"
                        onChange={(e) => {setIsChecked(e.target.checked)}}
                        trackCheckedColor={tokens.colors.blue[80]}
                    />
                </div>
            </div>
        </div>
    );
}

export default Controls;
