import {useState} from "react";
import {jsPDF} from "jspdf";
import {fetchUserAttributes} from "aws-amplify/auth";
import {client} from "../main";
import type {Language} from "../utils/types.ts";

interface TranscriptModalProps {
    transcription: string;
    targetLanguage: Language | null;
    closeModal: () => void;
}

function TranscriptModal(props: TranscriptModalProps) {
    const [comments, setComments] = useState<{ text: string; index: number }[]>([]);

    const font = props.targetLanguage?.name === "Arabic"
        ? "notoArabic" : props.targetLanguage?.name === "Chinese"
            ? "notoChinese" : "Helvetica";

    function addComment(index: number) {
        const commentText = prompt("Enter your comment");
        if (commentText) {
            setComments([...comments, {text: commentText, index}]);
        }
    }

    function generatePDF() {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Transcription with Comments", 10, 10);

        let fullTranscription = "";

        transcriptionWords.forEach((word, index) => {
            const comment = comments.find(comment => comment.index === index);
            const text = comment ? `${word} [${comment.text}]` : word;
            fullTranscription += text + " ";
        });

        doc.setFont(font);
        doc.setFontSize(12);
        doc.text(fullTranscription.trim(), 10, 20);

        return doc;
    }

    function downloadPDF() {
        const doc = generatePDF();
        doc.save("transcription.pdf");
    }

    function getBase64() {
        const doc = generatePDF();
        const dataUri = doc.output("datauristring");
        return dataUri.split(",")[1];
    }

    async function emailTranscript() {
        const user = await fetchUserAttributes();
        const email = user.email;
        if (email === undefined) {
            console.error("User email is undefined");
            alert("No email found");
            return;
        }

        try {
            const base64PDF = getBase64();

            const g = await client.queries.emailTranscript({
                email: email,
                pdf: base64PDF,
            });

            console.log(g.data);

        } catch (error) {
            console.error("Error sending email:", error);
            alert(error);
        }
    }

    const transcriptionWords = props.transcription.split(" ");

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
                                {transcriptionWords.map((word, index) => (
                                    <span
                                        key={index}
                                        className="cursor-pointer"
                                        onClick={() => addComment(index)}
                                    >
                                        {word}{" "}
                                        {comments.filter(comment => comment.index === index).map((comment, commentIndex) => (
                                            <span key={commentIndex} className="text-error italic">
                                                [{comment.text}]{" "}
                                            </span>
                                        ))}
                                    </span>
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
