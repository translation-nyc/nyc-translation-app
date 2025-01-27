export interface TranslationBoxProps {
    texts: TranslationTextEntry[];
}

export interface TranslationTextEntry {
    text: string;
    type: TranslationTextType;
}

export type TranslationTextType = "native" | "foreign" | "translated";

function TranslationBox(props: TranslationBoxProps) {
    return (
        <div className="w-3xl min-h-96 pt-3 p-4 border-gray-500 border-1 rounded-xl bg-gray-200">
            <div className="relative">
                <p className="absolute top-0 right-0 text-gray-500">
                    Transcription
                </p>
            </div>
            <div className="mt-10">
                {props.texts === undefined || props.texts.length === 0
                    ?
                    <p className="text-gray-500">
                        Waiting to begin speech...
                    </p>
                    :
                    props.texts.map((text, index) => {
                        let className = "";
                        switch (text.type) {
                            case "native":
                                className = "mt-4";
                                break;
                            case "foreign":
                                className = "mt-4 text-gray-500";
                                break;
                        }
                        return <>
                            {text.type === "translated" &&
                                <p className="mt-4 text-blue-600">
                                    (TRANSLATION)
                                </p>
                            }
                            <p key={index} className={className}>
                                {text.text}
                            </p>
                        </>
                    })
                }
            </div>
        </div>
    );
}

export default TranslationBox;
