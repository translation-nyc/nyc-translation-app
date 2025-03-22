import {useState} from "react";
import {jsPDF} from "jspdf";
import {client} from "../main";
import type {BaseTranscriptPart, Language, Transcript, TranscriptComment} from "../../amplify/utils/types.ts";
import {createPdf} from "../../amplify/utils/transcript-pdf.ts";

export interface TranscriptModalProps {
    transcription: string;
    targetLanguage: Language | null;
    closeModal: () => void;
    transcript: Transcript;
}

function TranscriptModal(props: TranscriptModalProps) {
    const [comments, setComments] = useState<TranscriptComment[]>([]);

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

    function generatePdf(): jsPDF {
        return createPdf(
            props.transcript.parts,
            comments,
            font,
        );
    }

    function downloadPDF() {
        const pdf = generatePdf();
        pdf.save("transcript.pdf");
    }

    async function emailTranscript() {
        try {
            const transcriptParts = props.transcript.parts.map(part => ({
                text: part.text,
                translatedText: part.translatedText,
            } as BaseTranscriptPart));
            const response = await client.queries.emailTranscript({
                transcriptParts: JSON.stringify(transcriptParts),
                comments: JSON.stringify(comments),
                font: font,
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
