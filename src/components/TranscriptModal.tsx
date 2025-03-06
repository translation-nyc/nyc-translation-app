import { useState } from "react";
import { jsPDF } from "jspdf";

interface TranscriptModalProps {
    transcription: string;
    closeModal: () => void;
}

function TranscriptModal(props: TranscriptModalProps) {

    const [comments, setComments] = useState<{ text: string; index: number }[]>([]);

    const addComment = (index: number) => {
        const commentText = prompt("Enter your comment");
        if (commentText) {
            setComments([...comments, { text: commentText, index }]);
        }
    }

    const generatePDF = () => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text("Transcription with Comments", 10, 10);

        let fullTranscription = '';

        transcriptionWords.forEach((word, index) => {
            const comment = comments.find(comment => comment.index === index);
            const text =  comment ? `${word} [${comment.text}]` : word;
            fullTranscription += text + ' ';
        }) 

        doc.setFontSize(12);
        doc.text(fullTranscription.trim(), 10, 20);
        
        return doc;
    };

    const downloadPDF = () => {
        const doc = generatePDF();
        doc.save("transcription.pdf")
    };

    const getBase64 = () => {
        const doc = generatePDF();
        const dataUri = doc.output('datauristring');
        const base64PDF = dataUri.split(",")[1];
        return base64PDF
        // console.log(base64PDF)
    }

    const emailTranscript = async () => {
        const email = "ggmihaylov@yahoo.co.uk"; // Replace with the actual recipient's email

        try {
            const base64PDF = getBase64();

            await fetch('https://6b8a5sx46e.execute-api.eu-west-2.amazonaws.com/emailTranscript', {
                mode: "no-cors",
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    pdf: base64PDF,
                }),
            });
            
        } catch (error) {
            console.error('Error sending email:', error);
            alert(error);
        }
    };

    const transcriptionWords = props.transcription.split(' ');

    return (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">

            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10">
                                    <svg className="size-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                                        <path d="M6 22H18C19.1046 22 20 21.1046 20 20V9.82843C20 9.29799 19.7893 8.78929 19.4142 8.41421L13.5858 2.58579C13.2107 2.21071 12.702 2 12.1716 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M13 2.5V9H19" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8 17H15" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8 13H15" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8 9H9" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-base font-semibold text-gray-900" id="modal-title">Review transcript and click to add comments</h3>
                                    <div className="mt-2">
                                        <div className="bg-blue-100 p-4 rounded-md">
                                            {/* <p className="text-sm">{props.transcription}</p> */}
                                            {transcriptionWords.map((word, index) => (
                                                <span
                                                    key={index}
                                                    className="cursor-pointer"
                                                    onClick={() => addComment(index)} // Handle click to add comment
                                                >
                                                    {word}{' '}
                                                    {comments.filter(comment => comment.index === index).map((comment, commentIndex) => (
                                                        <span key={commentIndex} className="text-red-500 italic">[{comment.text}] </span> // Display comment in red
                                                    ))}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            {/* <button type="button" className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto" onClick={emailTranscript}>Email Transcript</button>
                             */}
                            <button type="button" className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto" onClick={emailTranscript}>Email Transcript</button>
                            <button type="button" className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto" onClick={downloadPDF}>Download</button>
                            <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" onClick={props.closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default TranscriptModal;