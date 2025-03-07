import {useState} from "react";
import {Button, TextAreaField} from "@aws-amplify/ui-react";
import TranscriptModal from "./TranscriptModal.tsx";

interface TranscriptProps {
    transcript: string;
}

function Transcript(props: TranscriptProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="flex-1 bg-base-100 rounded-lg shadow-lg overflow-hidden p-4">
            {props.transcript}

            <div>
                <div>
                    <Button
                        variation="primary"
                        onClick={openModal}
                    >
                        Review
                    </Button>
                </div>
            </div>

            {isModalOpen && (
                <TranscriptModal transcription={props.transcript} closeModal={closeModal}/>
            )}
        </div>
    );
}

export default Transcript;
