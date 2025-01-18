//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";

function ExperimentInformation() {
	const [record, setRecord] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const recognitionRef = useRef(null);
	const isRecognitionActive = useRef(false);
	const activeTextareaRef = useRef(null);

	// State for various input and textarea fields
	const [aim, setAIM] = useState("");
	const [methodology, setMethodology] = useState("");
	const [results, setResults] = useState("");
	const [commentsAndAnalysis, setCommentsAndAnalysis] = useState("");
	const [nextSteps, setNextSteps] = useState("");
	const [experimentDataDescriptionInput, setExperimentDataDescriptionInput] = useState("");

	// Refs for textareas
	const ExperimentDataDescriptionInputRef = useRef(null);
	const AMIRef = useRef(null);
	const MethodologyRef = useRef(null);
	const ResultsRef = useRef(null);
	const CommentsAndAnalysisRef = useRef(null);
	const NextStepsRef = useRef(null);

	// Speech Recognition setup
	useEffect(() => {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			console.error("Speech Recognition is not supported in your browser.");
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "en-US";

		recognition.onresult = (event) => {
			console.log(event);
			let interimTranscript = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					if (activeTextareaRef.current === ExperimentDataDescriptionInputRef.current) {
						setExperimentDataDescriptionInput((prev) => prev + transcript + " ");
					} else if (activeTextareaRef.current === AMIRef.current) {
						setAIM((prev) => prev + transcript + " ");
					} else if (activeTextareaRef.current === MethodologyRef.current) {
						setMethodology((prev) => prev + transcript + " ");
					} else if (activeTextareaRef.current === ResultsRef.current) {
						setResults((prev) => prev + transcript + " ");
					} else if (activeTextareaRef.current === CommentsAndAnalysisRef.current) {
						setCommentsAndAnalysis((prev) => prev + transcript + " ");
					} else if (activeTextareaRef.current === NextStepsRef.current) {
						setNextSteps((prev) => prev + transcript + " ");
					}
				} else {
					interimTranscript += transcript;
				}
			}
		};

		recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			if (event.error === "aborted") {
				isRecognitionActive.current = false;
			}
			setIsListening(false);
		};

		recognition.onend = () => {
			console.log("Speech recognition ended.");
			isRecognitionActive.current = false;
			setIsListening(false);
		};

		recognitionRef.current = recognition;

		return () => {
			recognition.stop();
			recognitionRef.current = null;
		};
	}, []);

	const startListening = () => {
		console.log("Listening?")
		if (!record || !recognitionRef.current || isRecognitionActive.current) {
			console.log(record, recognitionRef.current, isRecognitionActive.current)
			return;
		};

		try {
			setIsListening(true);
			isRecognitionActive.current = true;
			recognitionRef.current.start();
		} catch (error) {
			console.error("Error starting recognition:", error);
			setIsListening(false);
		}
	};

	const stopListening = () => {
		console.log("Stoped listening")
		if (!record || !recognitionRef.current || !isRecognitionActive.current) return;

		try {
			setIsListening(false);
			if (isRecognitionActive.current) return;
			recognitionRef.current.stop();
		} catch (error) {
			console.error("Error stopping recognition:", error);
		}
	};
	const handleTextChange = (e) => {
		if (e.target === ExperimentDataDescriptionInputRef.current) {
			setExperimentDataDescriptionInput(e.target.value);
		} else if (e.target === AMIRef.current) {
			setAIM(e.target.value);
		} else if (e.target === AMIRef.current) {
			setAIM(e.target.value);
		} else if (e.target === MethodologyRef.current) {
			setMethodology(e.target.value);
		} else if (e.target === ResultsRef.current) {
			setResults(e.target.value);
		}
	};

	const handleTextareaFocus = (ref) => {
		activeTextareaRef.current = ref.current;
	};

	return (
		<div>
			<textarea
				ref={ExperimentDataDescriptionInputRef}
				value={experimentDataDescriptionInput}
				onChange={(e) => handleTextChange(e)}
				onFocus={() => handleTextareaFocus(ExperimentDataDescriptionInputRef)}
				onMouseEnter={() => startListening()}
				onMouseLeave={() => stopListening()}
				placeholder="Experiment Data Description"
				rows={3}
				cols={50}
			/>
			<textarea
				ref={AMIRef}
				value={aim}
				onChange={(e) => handleTextChange(e)}
				onFocus={() => handleTextareaFocus(AMIRef)}
				onMouseEnter={() => startListening()}
				onMouseLeave={() => stopListening()}
				placeholder="Aim"
				rows={3}
				cols={50}
			/>
			<textarea
				ref={MethodologyRef}
				value={methodology}
				onChange={(e) => handleTextChange(e)}
				onFocus={() => handleTextareaFocus(MethodologyRef)}
				onMouseEnter={() => startListening()}
				onMouseLeave={() => stopListening()}
				placeholder="Methodology"
				rows={3}
				cols={50}
			/>
			<textarea
				ref={ResultsRef}
				value={results}
				defaultValue="Default text"
				onChange={(e) => handleTextChange(e)}
				onFocus={() => handleTextareaFocus(ResultsRef)}
				onMouseEnter={() => startListening()}
				onMouseLeave={() => stopListening()}
				placeholder="Results"
				rows={3}
				cols={50}
			/>
			<textarea
				ref={CommentsAndAnalysisRef}
				value={commentsAndAnalysis}
				onChange={(e) => handleTextChange(e)}
				defaultValue="Default text"
				onFocus={() => handleTextareaFocus(CommentsAndAnalysisRef)}
				onMouseEnter={() => startListening()}
				onMouseLeave={() => stopListening()}
				placeholder="Comments and Analysis"
				rows={3}
				cols={50}
			/>
			<textarea
				ref={NextStepsRef}
				value={nextSteps}
				defaultValue="Default text"
				onChange={(e) => handleTextChange(e)}
				onFocus={() => handleTextareaFocus(NextStepsRef)}
				onMouseEnter={() => startListening()}
				onMouseLeave={() => stopListening()}
				placeholder="Next Steps"
				rows={3}
				cols={50}
			/>

			<div>
				<button onClick={() => setRecord((prev) => !prev)}>
					{record ? "Disable Speech to text" : "Enable Speech to text"}
				</button>
			</div>
		</div>
	);
}

export default ExperimentInformation;
