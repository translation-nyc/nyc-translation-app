import {useRef} from "react";
import {HelpCircle, Languages, Mail, Mic, Volume2} from "lucide-react";

function Help() {
    const dialogRef = useRef<HTMLDialogElement>(null);

    function openModal() {
        dialogRef.current?.showModal();
    }

    return (
        <>
            <button
                className="btn btn-ghost btn-circle"
                aria-label="Help button"
                onClick={openModal}
            >
                <HelpCircle className="w-5 h-5 text-blue-500"/>
            </button>

            {/* Help Modal */}
            <dialog ref={dialogRef} className="modal">
                <div className="modal-box max-w-xl max-h-150 p-5">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <div className="flex w-full flex-col">
                        <h3 className="font-bold text-2xl">
                            Help
                        </h3>
                        <h5 className="text-lg">
                            This is where you can find all information regarding this
                            application.
                        </h5>

                        <div className="divider"/>

                        <ul className="list bg-base-100 rounded-box shadow-md">
                            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                                Our features:
                            </li>

                            <li className="list-row">
                                <div className="text-4xl font-thin opacity-30 tabular-nums">
                                    01
                                </div>
                                <div>
                                    <Mic className="size-10 rounded-box"/>
                                </div>
                                <div>
                                    <div>
                                        Speech to Text
                                    </div>
                                    <div className="text-xs uppercase font-semibold opacity-60">
                                        Transcribes your text
                                    </div>
                                </div>
                                <p className="list-col-wrap text-xs">
                                    Using AWS tools we are able to use your devices microphone and turn that into a
                                    transcription for you to read.
                                </p>
                            </li>

                            <li className="list-row">
                                <div className="text-4xl font-thin opacity-30 tabular-nums">
                                    02
                                </div>
                                <div>
                                    <Languages className="size-10 rounded-box"/>
                                </div>
                                <div>
                                    <div>
                                        Translation
                                    </div>
                                    <div className="text-xs uppercase font-semibold opacity-60">
                                        Allows for you to communicate
                                    </div>
                                </div>
                                <p className="list-col-wrap text-xs">
                                    During your conversation the transcription will start to be translated into the
                                    preferred language of the non speaking participant.
                                </p>
                            </li>

                            <li className="list-row">
                                <div className="text-4xl font-thin opacity-30 tabular-nums">
                                    03
                                </div>
                                <div>
                                    <Volume2 className="size-10 rounded-box"/>
                                </div>
                                <div>
                                    <div>
                                        Text to Speech
                                    </div>
                                    <div className="text-xs uppercase font-semibold opacity-60">
                                        Plays audio through your speakers or connected audio devices
                                    </div>
                                </div>
                                <p className="list-col-wrap text-xs">
                                    Each time, you the council member has finished speaking, your translated words will
                                    to be turned into speech and played on your speakers so the constituent can hear
                                    what was just said.
                                </p>
                            </li>

                            <li className="list-row">
                                <div className="text-4xl font-thin opacity-30 tabular-nums">
                                    04
                                </div>
                                <div>
                                    <Mail className="size-10 rounded-box"/>
                                </div>
                                <div>
                                    <div>
                                        Email
                                    </div>
                                    <div className="text-xs uppercase font-semibold opacity-60">
                                        Transcripts sent to you
                                    </div>
                                </div>
                                <p className="list-col-wrap text-xs">
                                    Once you have finished the conversational and happy to stop the transcription
                                    process you are to read through a copy of the transcription. Comments can then be
                                    added to it here. Then you are able to send a pdf copy of the transcript straight to
                                    you.
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default Help;
