import {useState} from "react";
import {jsPDF} from "jspdf";
import {client} from "../main";
import type {Language, Transcript} from "../utils/types.ts";

export interface TranscriptModalProps {
    transcription: string;
    targetLanguage: Language | null;
    closeModal: () => void;
    transcript: Transcript;
}

interface Comment {
    text: string;
    index: number;
    partIndex: number;
    isTranslated: boolean;
}

function TranscriptModal(props: TranscriptModalProps) {
    const [comments, setComments] = useState<Comment[]>([]);

    let font = "";
    switch (props.targetLanguage?.name) {
        case "Arabic":
            font = "notoArabic";
            break;
        case "Chinese":
            font = "notoChinese";
            break;
        case "Russian":
            font = "notoChinese";
            break;
        case "Japanese":
            font = "noto-japanese";
            break;
        case "Korean":
            font = "notoKorean";
            break;
        default:
            font = "Helvetica";
    }

    function addComment(index: number, partIndex: number, isTranslated: boolean) {
        const commentText = prompt("Enter your comment");
        if (commentText) {
            setComments([...comments, { text: commentText, index, partIndex, isTranslated }]);
        }
    }

    function generatePDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth() - 20;
        const pageHeight = doc.internal.pageSize.getHeight() - 20;

        doc.setFontSize(16);
        doc.text("Transcript with comments", 10, 10);

        let fullTranscription = "";
        const parts = props.transcript.parts;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            part.text.split(" ").forEach((word, index) => {
                const comment = comments.find(comment =>
                    comment.index === index
                    && comment.partIndex === i
                    && !comment.isTranslated
                );
                const text = comment ? `${word} [${comment.text}]` : word;
                fullTranscription += text + " ";
            });

            fullTranscription += "\n";

            part.translatedText.split(" ").forEach((word, index) => {
                const comment = comments.find(comment =>
                    comment.index === index
                    && comment.partIndex === i
                    && comment.isTranslated
                );
                const text = comment ? `${word} [${comment.text}]` : word;
                fullTranscription += text + " ";
            });

            fullTranscription += "\n\n";
        }

        doc.setFont(font);
        doc.setFontSize(12);

        const lines = doc.splitTextToSize(fullTranscription.trim(), pageWidth);

        let y = 20;

        lines.forEach((line: string) => {
            if (y + 10 > pageHeight) {
                doc.addPage();
                y = 10;
            }
            doc.text(line, 10, y);
            y += 10;
        });

        return doc;
    }

    function downloadPDF() {
        const doc = generatePDF();
        doc.save("transcript.pdf");
    }

    function getBase64() {
        const doc = generatePDF();
        const dataUri = doc.output("datauristring");
        return dataUri.split(",")[1];
    }

    async function emailTranscript() {
        try {
            const base64PDF = getBase64();
            const response = await client.queries.emailTranscript({
                pdf: base64PDF,
            });
            console.log(response.data);
        } catch (error) {
            console.error("Error sending email: ", error);
            alert(error);
        }
    }

    return (
        <div className="modal modal-open">
            <div className="modal-box relative max-w-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0 bg-primary bg-opacity-20 p-3 rounded-full">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 22H18C19.1046 22 20 21.1046 20 20V9.82843C20 9.29799 19.7893 8.78929 19.4142 8.41421L13.5858 2.58579C13.2107 2.21071 12.702 2 12.1716 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M13 2.5V9H19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M8 17H15"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M8 13H15"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M8 9H9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium" id="modal-title">
                            Review transcript and click to add comments
                        </h3>
                        <div className="mt-2">
                            <div className="bg-base-200 p-4 rounded-md overflow-y-auto max-h-64">
                                {props.transcript.parts.map((part, partIndex) => (
                                    <div key={partIndex} className="mb-2">
                                        {part.text.split(" ").map((word, index) => (
                                            <span
                                                key={index}
                                                className="cursor-pointer"
                                                onClick={() => addComment(index, partIndex, false)}
                                            >
                                                {word}{" "}
                                                {comments.filter(comment =>
                                                    comment.index === index
                                                    && comment.partIndex === partIndex
                                                    && !comment.isTranslated
                                                ).map((comment, commentIndex) => (
                                                    <span key={commentIndex} className="text-error italic">
                                                        [{comment.text}]{" "}
                                                    </span>
                                                ))}
                                            </span>
                                        ))}

                                        <div className="text-gray-400">
                                            {part.translatedText.split(" ").map((word, index) => (
                                                <span
                                                    key={index}
                                                    className="cursor-pointer"
                                                    onClick={() => addComment(index, partIndex, true)}
                                                >
                                                    {word}{" "}
                                                    {comments.filter(comment =>
                                                        comment.index === index
                                                        && comment.partIndex === partIndex
                                                        && comment.isTranslated
                                                    ).map((comment, commentIndex) => (
                                                        <span key={commentIndex} className="text-error italic">
                                                            [{comment.text}]{" "}
                                                        </span>
                                                    ))}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-action">
                    <button onClick={emailTranscript} className="btn btn-primary">
                        Email Transcript
                    </button>
                    <button onClick={downloadPDF} className="btn btn-primary">
                        Download
                    </button>
                    <button onClick={props.closeModal} className="btn btn-outline">
                        Cancel
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={props.closeModal} />
        </div>
    );
}

export default TranscriptModal;
