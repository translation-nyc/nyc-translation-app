import {useState} from "react";
import {jsPDF} from "jspdf";
import {generateClient} from "aws-amplify/api";
import type {Schema} from "../../amplify/data/resource.ts";
import type {BaseTranscriptPart, Font, Transcript, TranscriptComment} from "../../amplify/utils/types.ts";
import {createPdf} from "../../amplify/utils/transcript-pdf.ts";
import {Languages} from "../../amplify/utils/languages.ts";

const client = generateClient<Schema>();

export interface TranscriptModalProps {
    transcription: string;
    closeModal: () => void;
    transcript: Transcript;
    fonts: Record<string, Font>;
}

function TranscriptModal(props: TranscriptModalProps) {
    const [comments, setComments] = useState<TranscriptComment[]>([]);

    function addComment(index: number, partIndex: number, isTranslated: boolean) {
        const commentText = prompt("Enter your comment");
        if (commentText) {
            setComments([...comments, {
                text: commentText,
                index,
                partIndex,
                isTranslated,
            }]);
        }
    }

    async function generatePdf(): Promise<jsPDF> {
        const languageCode = props.transcript.lastTargetLanguageCode;
        let font: Font | undefined;
        if (languageCode === Languages.ARABIC.transcribeCode) {
            font = props.fonts.notoArabic;
        } else if (languageCode === Languages.CHINESE.transcribeCode
            || languageCode === Languages.RUSSIAN.transcribeCode
        ) {
            font = props.fonts.notoChinese;
        } else if (languageCode === Languages.JAPANESE.transcribeCode) {
            font = props.fonts.notoJapanese;
        } else if (languageCode === Languages.KOREAN.transcribeCode) {
            font = props.fonts.notoKorean;
        } else {
            font = undefined;
        }

        return createPdf(
            props.transcript.parts,
            comments,
            font,
        );
    }

    async function downloadPDF() {
        const pdf = await generatePdf();
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
                languageCode: props.transcript.lastTargetLanguageCode ?? "",
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
                        <h3
                            className="text-lg font-medium"
                            id="modal-title"
                            aria-label="Review transcript header"
                        >
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
            <div className="modal-backdrop" onClick={props.closeModal}/>
        </div>
    );
}

export default TranscriptModal;
