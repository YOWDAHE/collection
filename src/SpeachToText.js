import React, { useState } from "react";

const SpeechToText = () => {
	const [text, setText] = useState("");
	const [isListening, setIsListening] = useState(false);

	// Check for browser support
	const SpeechRecognition =
		window.SpeechRecognition || window.webkitSpeechRecognition;

	if (!SpeechRecognition) {
		return <p>Speech Recognition is not supported in your browser.</p>;
	}

	const recognition = new SpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;
	recognition.lang = "en-US";

	const startListening = () => {
		setIsListening(true);
		recognition.start();

		recognition.onresult = (event) => {
			let interimTranscript = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					setText((prevText) => prevText + transcript + " ");
				} else {
					interimTranscript += transcript;
				}
			}
		};

		recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			setIsListening(false);
		};

		recognition.onend = () => {
			setIsListening(false);
		};
	};

	// Stop listening
	const stopListening = () => {
		setIsListening(false);
		recognition.stop();
	};

	return (
		<div style={{ textAlign: "center", padding: "20px" }}>
			<h1>Speech-to-Text</h1>
			<div>
				<button
					onClick={isListening ? stopListening : startListening}
					style={{
						padding: "10px 20px",
						fontSize: "16px",
						margin: "10px",
						cursor: "pointer",
						backgroundColor: isListening ? "#f44336" : "#4CAF50",
						color: "#fff",
						border: "none",
						borderRadius: "5px",
					}}
				>
					{isListening ? "Stop Listening" : "Start Listening"}
				</button>
			</div>
			<div style={{ marginTop: "20px" }}>
				<h3>Transcribed Text:</h3>
				<p
					style={{
						border: "1px solid #ccc",
						padding: "10px",
						borderRadius: "5px",
						backgroundColor: "#f9f9f9",
					}}
				>
					{text || "Start speaking..."}
				</p>
			</div>
		</div>
	);
};

export default SpeechToText;
