import {useState} from "react";

function TranslationTypeButtonRow() {
    const [selected, setSelected] = useState("speech");

    return (
        <div className="flex justify-center w-full">
            <div className="flex flex-row w-lg gap-4 m-4">
                <TranslationTypeButton
                    text="SPEECH"
                    selected={selected === "speech"}
                    onClick={() => setSelected("speech")}
                />
                <TranslationTypeButton
                    text="DOCUMENTS"
                    selected={selected === "documents"}
                    onClick={() => setSelected("documents")}
                />
                <TranslationTypeButton
                    text="TEXT"
                    selected={selected === "text"}
                    onClick={() => setSelected("text")}
                />
            </div>
        </div>
    );
}

interface TranslationTypeTabButtonProps {
    text: string;
    selected: boolean;
    onClick: () => void;
}

function TranslationTypeButton(props: TranslationTypeTabButtonProps) {
    let className: string;
    if (props.selected) {
        className = "bg-blue-500 border-3 border-blue-600 text-white cursor-not-allowed";
    } else {
        className = "bg-white border-2 border-gray-500 text-blue-500 cursor-pointer hover:bg-blue-400 hover:border-blue-500 hover: hover:text-white";
    }

    return (
        <button
            className={`${className} transition duration-200 rounded-full p-2 w-full`}
            disabled={props.selected}
            onClick={props.onClick}
        >
            {props.text}
        </button>
    );
}

export default TranslationTypeButtonRow;
