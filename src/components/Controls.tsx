import { useState } from "react";
import { PlayIcon, StopIcon } from "../assets/icons";
import { textToSpeech } from "../utils/text-to-speech.ts";

interface ControlsProps {
	isLoading: boolean;
	isTranslating: boolean;
	onToggleTranslation: () => void;
	targetLanguage: string;
	onChangeTargetLanguage: (language: string) => void;
	transcript: string;
}

function Controls(props: ControlsProps) {
	const [isChecked, setIsChecked] = useState(false);

	return (
		<div className="w-full md:w-72 p-6 bg-white rounded-lg shadow-lg"> {/* Container for controls*/}
			<div className="space-y-6">
				<div className="flex justify-center"> {/* Container for start/stop button*/}
					<button
						className={`btn w-full ${props.isTranslating ? "btn-error" : "btn-success"}`}
						disabled={props.isLoading}
						onClick={props.onToggleTranslation}
					>
						{props.isLoading ? (
							"Loading..."
						) : (
							props.isTranslating ? (
								<>
									<StopIcon className="mr-2 h-5 w-5"/>
									Stop Translation
								</>
							) : (
								<>
									<PlayIcon className="mr-2 h-5 w-5"/>
									Start Translation
								</>
							)
						)}
					</button>
				</div>
				
				<div className="space-y-2"> {/* Container for target language controls*/}
					<div>
						<h3 className="font-bold text-lg">
							Target Language
						</h3>
					</div>
					<div>
						<select 
							className="select select-bordered w-full"
							value={props.targetLanguage}
							onChange={(e) => props.onChangeTargetLanguage(e.target.value)}
						>
							<option value="" disabled>Select a language</option>
							<option value="French">French</option>
							<option value="Spanish">Spanish</option>
							<option value="Arabic">Arabic</option>
							<option value="Chinese">Chinese</option>
						</select>
					</div>
					<div>
						The currently selected language is: {props.targetLanguage}
					</div>
				</div>
				
				<div className="form-control">
					<label className="label cursor-pointer justify-start gap-2">
						<input 
							type="checkbox" 
							className="toggle toggle-primary"
							checked={isChecked}
							onChange={(e) => setIsChecked(e.target.checked)}
						/>
						<span className="label-text">Auto-punctuation</span>
					</label>
				</div>
				
				<div>
					<button
						className="btn btn-primary w-full"
						onClick={() => textToSpeech(props.transcript)}
					>
						Play Transcription
					</button>
				</div>
			</div>
		</div>
	);
}

export default Controls;