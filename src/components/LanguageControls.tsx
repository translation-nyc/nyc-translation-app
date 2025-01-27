import {useState} from "react";

function LanguageControls() {
    const [on, setOn] = useState(false);
    const languages = ["French", "Spanish", "German"];
    const [selectedLanguage, setSelectedLanguage] = useState("");

    return (
        <div className="flex flex-col gap-4 m-2 items-center">
            <StartButton
                on={on}
                onClick={() => setOn(!on)}
            />
            <LanguageSelector
                languages={languages}
                onChange={language => setSelectedLanguage(language)}
            />
            {on &&
                <p className="text-lg text-black">
                    Listening...
                </p>
            }
        </div>
    );
}

interface StartButtonProps {
    on: boolean;
    onClick: () => void;
}

function StartButton(props: StartButtonProps) {
    let className: string;
    if (props.on) {
        className = "bg-red-400 border-red-700 hover:bg-red-500 hover:border-red-800"
    } else {
        className = "bg-green-400 border-green-700 hover:bg-green-500 hover:border-green-800"
    }

    return (
        <button
            className={`${className} transition duration-200 cursor-pointer size-20 rounded-full border-2`}
            onClick={props.onClick}
        >
            <p className="text-white text-xl font-bold">
                {props.on ? "OFF" : "ON"}
            </p>
        </button>
    );
}

interface LanguageSelectorProps {
    languages: string[];
    onChange: (language: string) => void;
}

function LanguageSelector(props: LanguageSelectorProps) {
    return(
        <select
            onChange={(event) => props.onChange(event.target.value)}
            className="bg-white border-2 border-gray-500 rounded-full p-2 w-full"
        >
            <option value="" disabled selected hidden>
                Select language
            </option>
            {props.languages.map((language, index) => {
                return (
                    <option key={index} value={language}>
                        {language}
                    </option>
                );
            })}
        </select>
    )
}

export default LanguageControls;
