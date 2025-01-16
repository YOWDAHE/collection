//@ts-nocheck directive
import React, {
	useState,
	useEffect,
	useRef,
	ChangeEvent,
	useCallback,
} from "react";
import { UpdateProjectExperimentType } from "../Types/projectExperiment";
import { UpdateOldExperimentFormats } from "../lib/controller";

import styles from "./Experiment.module.css";

import "../lib/RequireUser/index.css";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, set } from "firebase/database";
import { auth, app } from "../lib/firebase";
import {
	deleteDoc,
	doc,
	getFirestore,
	updateDoc,
	collection,
	setDoc,
	deleteField,
	query,
	where,
	onSnapshot,
	orderBy,
} from "firebase/firestore";
import WelcomePage from "../WelcomePage/WelcomePage";
import { profile } from "console";

const tempUser = localStorage.getItem("userUID");
const prjTitle = localStorage.getItem("projectTitle");
localStorage.setItem("firstTime", "Yes");
const numberOfExperiments = localStorage.getItem("expNum");
let experimentsCounter = 0;

interface IProps {
	projectExperiment: NewProjectExperimentType;
}

//*new
const uploadUrl =
	"https://us-central1-footprints-b291f.cloudfunctions.net/uploadFile";

const deleteFile =
	"https://us-central1-footprints-b291f.cloudfunctions.net/deleteFile";

const generatePDFUrl = "https://createpdf-jfsryssq6a-uc.a.run.app";
const sendEmailUrl =
	"https://us-central1-footprints-b291f.cloudfunctions.net/sendEmail";

const db = getFirestore();

var aimFrom = "";
var collaboratorFrom = "";
var commentsAndAnalysisFrom = "";
var experimentDateFrom = "";
var experimentProfileFrom: NewProjectExperimentType;
var experimentTitleFrom = "";
var experimentUserIDFrom = "";
var methodologyFrom = "";
var nextStepsFrom = "";
var pdfFileURLFrom = "";
var projectTitleFrom = "";
var projectExperimentFrom = "";
var protocolNameDateVersionFrom = "";
var projectUserIDFrom = "";
var resultsFrom = "";
var selectedFrom = "";
var signatureRequestedFrom = "";
var signedFrom = "";

var adminUID = "";
var adminEmail = "";
var title = "";

var bodyStyles = document.body.style;
var destFileName = "";

var fromProfile: NewProjectExperimentType = null;
var toProfile: NewProjectExperimentType = null;
var excessProfile: NewProjectExperimentType = null;

function DateToYYYYMMDD(date: Date) {
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let monthString = month.toString();
	if (month < 10) {
		monthString = "0" + monthString;
	}
	let day = date.getDate();
	let dayString = day.toString();
	if (day < 10) {
		dayString = "0" + dayString;
	}
	let dateString = `${year}/` + monthString + "/" + dayString;
	return dateString;
}

async function generateAndSendAnEmail(
	documentId,
	researchName,
	emailTo,
	administratorGroup
) {
	const body = {
		documentId: documentId,
		researcher: researchName,
		emailTo: emailTo,
		administratorGroup: administratorGroup,
	};
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	};
	const generatePdfRequest = await fetch(sendEmailUrl, options);
	if (!generatePdfRequest.ok) {
		throw new Error(`generateFailed: ${generatePdfRequest.statusText}`);
	}
	const response = await generatePdfRequest.json();
	console.log(response);
	return response;
}

async function generatePdfFile(documentId, researchName) {
	const body = {
		documentId: documentId,
		researcher: researchName,
	};
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	};
	const generatePdfRequest = await fetch(generatePDFUrl, options);
	if (!generatePdfRequest.ok) {
		throw new Error(`generateFailed: ${generatePdfRequest.statusText}`);
	}
	const response = await generatePdfRequest.json();
	console.log(response);
	return response;
}

function ExperimentInformation({ projectExperiment }: IProps) {
	const docID = projectExperiment;
	const tempUID: string = localStorage.getItem("userUID")!;
	const userProfileName: any = localStorage.getItem("userProfileName");

	const [selectedFile, setSelectedFile] = useState<File | null>(null); // Add state for the selected file

	const [copyColor, setCopyColor] = useState("black");
	const [aim, setAIM] = useState("");
	const [collaborator, setCollaborator] = useState("");
	const [commentsAndAnalysis, setCommentsAndAnalysis] = useState("");
	const [copyButton, setCopyButton] = useState("Copy");
	const [copySelected, setCopySelected] = useState(false);
	const [uploadButtonDisabled, setUploadButtonDisabled] = useState(true);
	const [removeButtonDisabled, setRemoveButtonDisabled] = useState(true);
	//const [requestButtonDisabled, setRequestButtonDisabled] = useState(
	//  projectExperiment.requestButtonDisabled
	//);

	const [requestButtonDisabled, setRequestButtonDisabled] = useState(false);

	const [experimentDataDescription, setExperimentDataDescription] = useState([]);
	const [experimentDataDescriptionInput, setExperimentDataDescriptionInput] =
		useState("");

	const [experimentDataShareable, setExperimentDataShareable] = useState([]);
	const [experimentDataShareableInput, setExperimentDataShareableInput] =
		useState("");

	const [experimentDataFileName, setExperimentDataFileName] = useState([]);

	const [dataFileSelectIndex, setDataFileSelectIndex] = useState(0);

	var selectedShareableValue = "";

	const [deleteButton, setDeleteButton] = useState("Delete");
	const [experimentTitle, setExperimentTitle] = useState("");
	const [messages, setMessages] = useState(
		"You can copy/paste, edit, or delete your experiments..."
	);
	const [methodology, setMethodology] = useState("");
	const [nextSteps, setNextSteps] = useState("");
	const [saveButton, setSaveButton] = useState("");
	const [pdfFileURL, setpdfFileURL] = useState("");
	const [pasteButton, setPasteButton] = useState("Paste");
	const [uploadButton, setUploadButton] = useState("--------");
	const [removeButton, setRemoveButton] = useState("--------");
	const [pdfButton, setPDFButton] = useState("");
	const [experimentDate, setExperimentDate] = useState("");
	const [projectTitle, setProjectTitle] = useState("");
	const [projectUseID, setProjectUseID] = useState(
		projectExperiment.experimentUserID
	);
	const [requestSignature, setRequestSignature] = useState(
		projectExperiment.requestSignature
	);
	const [projectExperimentSigned, setProjectExperimentSigned] = useState("");
	const [protocolNameDateVersion, setProtocolNameDateVersion] = useState("");
	const [results, setResults] = useState("");
	const [selectButton, setSelectButton] = useState("Select");
	const [signatureRequested, setSignatureRequested] = useState("");
	const [signed, setSigned] = useState("");
	const docRef = doc(db, "projectExperiments", projectExperiment.id);
	const [selected, setSelected] = useState("no");
	var fromToError = 0;

	const [projectProfiles, setProjectProfiles] = useState<
		NewProjectProfileType[]
	>([]);
	const [groupProfiles, setGroupProfiles] = useState<NewGroupProfileType[]>([]);

	const [text, setText] = useState("");
	const [record, setRecord] = useState<boolean>(false);
	const [isListening, setIsListening] = useState(false);
	const recognitionRef = useRef(null);
	const isRecognitionActive = useRef(false);

	const ExperimentDataDescriptionInputRef = useRef(null);
	const AMIRef = useRef(null);
	const MethodologyRef = useRef(null);
	const ResultsRef = useRef(null);
	const ProtocolNameDateVersionRef = useRef(null);
	const CommentsAndAnalysisRef = useRef(null);
	const NextStepsRef = useRef(null);
	const SharableRef = useRef(null);
	const activeTextareaRef = useRef(null);

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
			let interimTranscript = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					if (
						activeTextareaRef.current === ExperimentDataDescriptionInputRef.current
					) {
						setExperimentDataDescriptionInput(
							(prevText) => prevText + transcript + " "
						);
					}
					if (activeTextareaRef.current === AMIRef.current) {
						setAIM((prevText) => prevText + transcript + " ");
					}
					if (activeTextareaRef.current === MethodologyRef.current) {
						setMethodology((prevText) => prevText + transcript + " ");
					}
					if (activeTextareaRef.current === ResultsRef.current) {
						setResults((prevText) => prevText + transcript + " ");
					}
					if (activeTextareaRef.current === ProtocolNameDateVersionRef.current) {
						setProtocolNameDateVersion((prevText) => prevText + transcript + " ");
					}
					if (activeTextareaRef.current === CommentsAndAnalysisRef.current) {
						setCommentsAndAnalysis((prevText) => prevText + transcript + " ");
					}
					if (activeTextareaRef.current === NextStepsRef.current) {
						setNextSteps((prevText) => prevText + transcript + " ");
					}
					if (activeTextareaRef.current === SharableRef.current) {
						setExperimentDataShareableInput(
							(prevText) => prevText + transcript + " "
						);
					}
				} else {
					interimTranscript += transcript;
				}
			}
		};

		recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			if (event.error === "aborted") {
				isRecognitionActive.current = false; // Handle aborted error
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
			// Clean up the recognition instance on unmount
			recognition.stop();
			recognitionRef.current = null;
		};
	}, []);

	const startListening = () => {
		if (!record) return;
		if (!recognitionRef.current || isRecognitionActive.current) {
			console.log("Recognition is already active or unavailable.");
			return;
		}

		try {
			setIsListening(true);
			isRecognitionActive.current = true;
			recognitionRef.current.start();
			console.log("Started listening");
		} catch (error) {
			console.error("Error starting recognition:", error);
			setIsListening(false);
		}
	};

	const stopListening = () => {
		if (!record) return;
		if (!recognitionRef.current || !isRecognitionActive.current) {
			console.log("Recognition is not active.");
			return;
		}

		try {
			setIsListening(false);
			recognitionRef.current.stop();
			console.log("Stopped listening");
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
		} else if (e.target === ProtocolNameDateVersionRef.current) {
			setProtocolNameDateVersion(e.target.value);
		} else if (e.target === CommentsAndAnalysisRef.current) {
			setCommentsAndAnalysis(e.target.value);
		} else if (e.target === NextStepsRef.current) {
			setNextSteps(e.target.value);
		} else if (e.target === SharableRef.current) {
			setExperimentDataShareableInput(e.target.value);
		}
	};

	const handleTextareaFocus = (ref) => {
		activeTextareaRef.current = ref.current;
	};

	async function handleRequestClick() {
		//  getDoc(doc(getFirestore(), "projectProfiles", "projectTitle")).then(
		//  (projectTitle) => {
		//    console.log("adminInfo projectTitle = ", projectTitle);
		//  }
		//);
		// Call cloud run function passing the doc.id of this firestore database document:
		// createPDF(projectExperiment.id)
		console.log("in handleRequestClick...");

		console.log("experimentID = ", projectExperiment.id);
		console.log("userProfileName = ", userProfileName);
		console.log("adminEmail = ", adminEmail);
		console.log("title = ", title);
		//title = doc.data().title;
		//adminEmail = doc.data().administratorEmail;
		// Disable button
		setRequestButtonDisabled(true);
		// Set request button text to "Requested"
		setRequestSignature("Requested");

		const res = await generateAndSendAnEmail(
			projectExperiment.id,
			userProfileName,
			adminEmail,
			title
		);
		setRequestSignature("Requested");
		setMessages(
			"Request has been made and an email has been sent with your experiment for approval."
		);
		// Update the document signatureRequested field
		updateDoc(docRef, {
			signatureRequested: "yes",
		});
	}

	//*Replace any character that is not a letter, number, or underscore with '_' - new
	const sanitizeFileName = (fileName: string): string => {
		console.log(" file name before = ", fileName);
		const tempFile = fileName.replace(/[^a-zA-Z0-9]/g, "_");
		console.log("file name after = ", tempFile);
		return fileName.replace(/[^a-zA-Z0-9]/g, "_");
	};

	//*Function to upload a data file
	async function uploadDataFile(file: File) {
		console.log("in uploadDataFile...");
		// Sanitize the file name
		const sanitizedFileName = sanitizeFileName(file.name);
		console.log("sanitizedFileName = ", sanitizedFileName);
		// Create a new File object with the sanitized file name
		const sanitizedFile = new File([file], sanitizedFileName, {
			type: file.type,
		});
		console.log("sanitizedFile = ", sanitizedFile);
		const formData = new FormData();
		formData.append("myfile", sanitizedFile);
		console.log("formData = ", formData);
		try {
			const response = await fetch(uploadUrl, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`Upload failed: ${response.statusText}`);
			}

			const result = await response.text(); // Assuming the server returns plain text
			console.log("Upload successful:", result);

			console.log("file name:", file.name);
		} catch (error) {
			console.error("Upload error:", error);
		}

		//Now reset dataDescriptionInput, dataShareableInput, and fileSelected to ""
		setRemoveButton("Remove");
		setRemoveButtonDisabled(false);
		setMessages(
			"The file, Data Description, and Shareable options have been uploaded..."
		);
	}

	//*Handle file input change event - new
	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		console.log("in handleFileChange and file = ", file);
		if (file) {
			console.log("Selected file:", file);
			console.log("Selected file name = ", file.name);
			setSelectedFile(file); // Store the selected file in state
			setMessages("File selected...");

			changeSaveButtonTest();
		}
	}

	//*Handle the upload button click - new
	function handleUploadClick() {
		console.log("in handleUploadClick");

		console.log("dataDescription input = ", experimentDataDescriptionInput);
		console.log("selectedFile.name = ", selectedFile.name);
		console.log("dataShareable input = ", experimentDataShareableInput);

		let tempArray = experimentDataDescription;
		tempArray.push(experimentDataDescriptionInput);
		setExperimentDataDescription(tempArray);
		tempArray = experimentDataShareable;
		tempArray.push(experimentDataShareableInput);
		setExperimentDataShareable(tempArray);
		tempArray = experimentDataFileName;
		tempArray.push(selectedFile.name);
		setExperimentDataFileName(tempArray);

		let myMap = new Map<string, string>([]);
		let myArray = [];
		let myObject = Object.fromEntries(myMap);
		for (let i = 0; i < experimentDataDescription.length; i++) {
			myMap = new Map<string, string>([
				["dataDescription", experimentDataDescription[i]],
				["dataFileName", experimentDataFileName[i]],
				["dataShareable", experimentDataShareable[i]],
			]);
			console.log("map = ", myMap);

			myObject = Object.fromEntries(myMap);
			console.log(" myObject = ", myObject);

			myArray.push(myObject);
			console.log("myArray = ", myArray);
		}

		updateDoc(docRef, {
			experimentData: myArray,
		});

		uploadDataFile(selectedFile);

		setUploadButtonDisabled(true);
		setUploadButton("--------");
	}

	function reloadFromError() {
		window.location.reload();
	}

	function messagesFunction(projectExperiments: NewProjectExperimentType) {}

	function copyButtonSelected() {
		console.log(" in select and copySelected = ", copySelected);
		const elem = document.getElementById("copy-button");
		elem.style.color = "ivory";
		bodyStyles.setProperty("--copy-btn-active", "ivory");

		setCopySelected(true);
		setMessages(
			"Now choose an experiment to copy to by pressing its Paste button or press the Copy button again to cancel"
		);
		aimFrom = projectExperiment.aim;
		collaboratorFrom = projectExperiment.collaborator;
		commentsAndAnalysisFrom = projectExperiment.commentsAndAnalysis;
		//**Here we need to wrap the following 3 variables into an object and push to the experimentData array */
		//**However, we can leave the push for the paste side. It is enough here to get the froms done */
		//dataDescriptionFrom = projectExperiment.dataDescription;
		//dataURLFrom = projectExperiment.dataURL;
		//dataShareFrom = projectExperiment.dataShare;
		//We are not including experimentDate so as to maintain integrity
		experimentTitleFrom = projectExperiment.experimentTitle;
		methodologyFrom = projectExperiment.methodology;
		nextStepsFrom = projectExperiment.nextSteps;
		//We are not including experimentUserID as that has already been handled at the time the experiment was created
		//We are not including the pdf because of integrity...the experiment will need reverification
		//pdfFileURLFrom = projectExperiment.pdfFileURL;
		projectTitleFrom = projectExperiment.projectTitle;
		protocolNameDateVersionFrom = projectExperiment.protocolNameDateVersion;
		resultsFrom = projectExperiment.results;
		//selectedFrom = projectExperiment.selected;
		//We are not including signature items, again due to integrity and the necessity of reviewing the copied experiment
		//signatureRequestedFrom = projectExperiment.signatureRequested;
		//signedFrom = projectExperiment.signed;
	}

	function copyButtonDeselected() {
		const elem = document.getElementById("copy-button");
		elem.style.color = "black";

		console.log(" in deselect and copySelected = ", copySelected);
		setCopySelected(false);

		setMessages("You can copy/paste, edit, or delete your experiments...");
		bodyStyles.setProperty("copy-btn-active", "black");
		aimFrom = "";
		collaboratorFrom = "";
		commentsAndAnalysisFrom = "";
		//dataDescriptionFrom = "";

		//dataURLFrom = "";
		//dataShareFrom = "";

		experimentTitleFrom = "";
		methodologyFrom = "";
		nextStepsFrom = "";
		//pdfFileURLFrom = projectExperiment.pdfFileURL;
		//projectDateFrom = projectExperiment.projectDate;
		projectExperimentFrom = "";

		projectTitleFrom = "";

		projectUserIDFrom = "";
		protocolNameDateVersionFrom = "";
		resultsFrom = "";
		//selectedFrom = projectExperiment.selected;
		signatureRequestedFrom = "";
		signedFrom = "";
		window.location.reload();
	}

	function copyButtonFunction(projectExperiments: NewProjectExperimentType) {
		console.log("copySelected = ", copySelected);
		if (!copySelected) {
			copyButtonSelected();
		} else {
			copyButtonDeselected();
		}

		//for (let i = 0; i < projectExperiment.length; i++) {
		//setCopyButton("");
		//setPasteButton("Paste");
		//setDeleteButton("");
		//setSaveButton("");
		//}
	}
	async function deleteButtonFunction(
		projectExperiment: UpdateExperimentProfileType
	) {
		setMessages("Deleted and will refresh in 2 seconds");
		await deleteDoc(doc(db, "projectExperiments", projectExperiment.id));
		setTimeout(reloadFromError, 2000);
	}

	function pasteButtonFunction(projectExperiment: NewProjectExperimentType) {
		setAIM(aimFrom);
		//projectExperiment.collaborator = collaboratorFrom;
		setCollaborator(collaboratorFrom);
		//projectExperiment.commentsAndAnalysis = commentsAndAnalysisFrom;
		setCommentsAndAnalysis(commentsAndAnalysisFrom);

		//**Here we are not updating the following 3 variables for integrity purposes */
		//projectExperiment.dataURL = dataURLFrom;
		//setDataURL(dataURLFrom);
		//projectExperiment.dataShare = dataShareFrom;
		//setDataShare(dataShareFrom);
		//projectExperiment.dataDescription = dataDescriptionFrom;
		//setDataDescription(dataDescriptionFrom);

		//**We are not updating date for integrity purposes */
		//projectExperiment.experimentDate = experimentDateFrom;
		//setExperimentDate(experimentDateFrom);

		//projectExperiment.experimentTitle = experimentTitleFrom;
		setExperimentTitle(experimentTitleFrom);
		//projectExperiment.methodology = methodologyFrom;
		setMethodology(methodologyFrom);
		//projectExperiment.nextSteps = nextStepsFrom;
		setNextSteps(nextStepsFrom);

		//**PDF is not updated because of integrity */
		//projectExperiment.pdfFileURL = pdfFileURLFrom;
		//setpdfFileURL(pdfFileURLFrom);

		//**It is not necessary to update project title as that was created when experiment was created */
		//projectExperiment.projectTitle = projectTitleFrom;
		//setProjectTitle(projectTitleFrom);

		//**project userid already exists */
		//setProjectUseID(projectUserIDFrom);

		//projectExperiment.protocolNameDateVersion = protocolNameDateVersionFrom;
		setProtocolNameDateVersion(protocolNameDateVersionFrom);
		//projectExperiment.results = resultsFrom;
		setResults(resultsFrom);

		//**The following are not copied due to integrity */
		//projectExperiment.signatureRequested = signatureRequestedFrom;
		//setSignatureRequested(signatureRequestedFrom);
		//projectExperiment.signed = signedFrom;
		//setProjectExperimentSigned(signedFrom);

		aimFrom = "";
		collaboratorFrom = "";
		commentsAndAnalysisFrom = "";
		//dataDescriptionFrom = [];
		//dataURLFrom = "";
		//dataShareFrom = "";
		experimentTitleFrom = "";
		methodologyFrom = "";
		nextStepsFrom = "";
		//pdfFileURLFrom = "";
		//experimentDateFrom = "";
		//projectExperimentFrom = "";
		//projectTitleFrom = "";
		//projectUserIDFrom = "";
		protocolNameDateVersionFrom = "";
		resultsFrom = "";
		//selectedFrom = "";
		//signatureRequestedFrom = "";
		//signedFrom = "";
		//setMessages("Copied...now select a project to copy to");

		setMessages("Pasted, now press the Save button to complete the update...");
		//setTimeout(reloadFromError, 2000);
		changeSaveButtonOn();
		//setSelected("yes");

		const elem = document.getElementById("copy-button");
		elem.style.color = "black";
		bodyStyles.setProperty("--copy-btn-active", "black");
		setCopySelected(false);
	}

	const deleteFile = async (filename: string) => {
		const url = `https://us-central1-footprints-b291f.cloudfunctions.net/deleteFile?filename=${encodeURIComponent(
			filename
		)}`;
		console.log("url = ", url);
		try {
			const response = await fetch(url, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			//const message = await response.text();
			const result = await response.text();
			if (response.ok) {
				console.log("File deleted successfully:", result);
			} else {
				console.error("Failed to delete file:", response.status, result);
			}
		} catch (error) {
			console.error("Error during file deletion:", error);
		}
	};

	const handleRemoveClick = (e: React.ChangeEvent<HTMLSelectElement>) => {
		console.log("in handleRemoveClick");

		console.log("dataFileSelectIndex = ", dataFileSelectIndex);

		console.log("before experimentDataFileName", experimentDataFileName);
		console.log("before experimentDataDescription", experimentDataDescription);
		console.log("before experimentDataShareable", experimentDataShareable);
		console.log("experimentDataFileName length = ", experimentDataFileName);
		const tempLength = experimentDataFileName.length;
		//Rebuild the experimentData entry for this experiment:
		//-read the object elements into tempArray, one at a time.
		//-check each object read's info for a match with the subgroup selection's title and description
		//-when a match is found skip writing object to tempArray
		//-when all elements are read update the currentGroup's doc with the array
		let removeFile = "";
		let tempFileName = "";
		let tempDescription = "";
		let tempShareable = "";
		let tempArray = [];
		let found = false;
		if (projectExperiment.experimentData !== undefined) {
			for (let j = 0; j < projectExperiment.experimentData.length; j++) {
				if (projectExperiment.experimentData[j] !== undefined) {
					for (const [key, value] of Object.entries(
						projectExperiment.experimentData[j]
					)) {
						//retrieve the key value pairs for this entry for
						if (key === "dataFileName") {
							tempFileName = value;
							console.log("dataFileName = ", tempFileName);
						} else if (key === "dataDescription") {
							tempDescription = value;
							console.log("dataDescription = ", tempDescription);
						} else if (key === "dataShareable") {
							tempShareable = value;
							console.log("dataShareable = ", tempShareable);
						}
					}
					//Are we looking at the filename and does it match the selected filename?
					if (tempFileName !== experimentDataFileName[dataFileSelectIndex]) {
						//No, so write out the entry to the temporary array
						tempArray.push(projectExperiment.experimentData[j]);
						console.log("names don't match...");
					} else {
						//retain the file name for bucket removal
						removeFile = sanitizeFileName(tempFileName);
					}
					//No need for an else because when there is a match we will skip over it and not write it
				}
			}
		}
		//Finished creating the temp array so update the experimentData entry
		const docRef = doc(db, "projectExperiments", projectExperiment.id);
		updateDoc(docRef, {
			experimentData: tempArray,
		});

		//Delete the file from the bucket
		console.log("removeFile = ", removeFile);
		// Usage
		deleteFile(removeFile);
		setMessages(
			"The file, Data Description, and Shareable options have been removed..."
		);

		//Get rid of the item to be removed across all 3 arrays
		console.log(
			"experimentDataFileName before splice = ",
			experimentDataFileName
		);

		tempArray = experimentDataFileName;
		tempArray.splice(dataFileSelectIndex, 1);
		setExperimentDataFileName(tempArray);
		console.log("tempArray after splice = ", tempArray);

		tempArray = experimentDataDescription;
		tempArray.splice(dataFileSelectIndex, 1);
		setExperimentDataDescription(tempArray);
		setExperimentDataDescriptionInput("");

		tempArray = experimentDataShareable;
		tempArray.splice(dataFileSelectIndex, 1);
		setExperimentDataShareable(tempArray);
		setExperimentDataShareableInput("");

		if (tempLength == 1) {
			setRemoveButton("--------");
			setRemoveButtonDisabled(true);
		}
	};

	const saveExperimentChanges: (
		arg0: string,
		arg1: string,
		arg2: string,
		arg3: string,
		arg4: string,
		arg5: string,
		arg6: string,
		arg7: string,
		arg8: string,
		arg9: string,
		arg10: string
	) => void = () => {
		const docRef = doc(db, "projectExperiments", projectExperiment.id);
		console.log("in Save Experiment Changes");
		//Note that projectUserID, signed, and date are not changeable by the user
		if (aim != "") {
			updateDoc(docRef, {
				aim: aim,
			});
		} else if (projectExperiment.aim != "") {
			updateDoc(docRef, {
				aim: projectExperiment.aim,
			});
		} else {
			updateDoc(docRef, {
				aim: "",
			});
		}

		if (collaborator != "") {
			updateDoc(docRef, {
				collaborator: collaborator,
			});
		} else if (projectExperiment.collaborator != "") {
			updateDoc(docRef, {
				collaborator: projectExperiment.collaborator,
			});
		} else {
			updateDoc(docRef, {
				collaborator: "",
			});
		}

		if (commentsAndAnalysis != "") {
			updateDoc(docRef, {
				commentsAndAnalysis: commentsAndAnalysis,
			});
		} else if (projectExperiment.commentsAndAnalysis != "") {
			updateDoc(docRef, {
				commentsAndAnalysis: projectExperiment.commentsAndAnalysis,
			});
		} else {
			updateDoc(docRef, {
				commentsAndAnalysis: "",
			});
		}

		//We are updating date because at some time we will enable the creation of new experiments

		if (experimentDate != "") {
			updateDoc(docRef, {
				experimentDate: experimentDate,
			});
		} else if (projectExperiment.experimentDate != "") {
			updateDoc(docRef, {
				experimentDate: projectExperiment.experimentDate,
			});
		} else {
			updateDoc(docRef, {
				experimentDate: " ",
			});
		}

		if (experimentTitle != "") {
			updateDoc(docRef, {
				experimentTitle: experimentTitle,
			});
		} else if (projectExperiment.experimentTitle != "") {
			updateDoc(docRef, {
				experimentTitle: projectExperiment.experimentTitle,
			});
		} else {
			updateDoc(docRef, {
				experimentTitle: " ",
			});
		}

		if (methodology != "") {
			updateDoc(docRef, {
				methodology: methodology,
			});
		} else if (projectExperiment.methodology != "") {
			updateDoc(docRef, {
				methodology: projectExperiment.methodology,
			});
		} else {
			updateDoc(docRef, {
				methodology: " ",
			});
		}

		if (nextSteps != "") {
			updateDoc(docRef, {
				nextSteps: nextSteps,
			});
		} else if (projectExperiment.nextSteps != "") {
			updateDoc(docRef, {
				nextSteps: projectExperiment.nextSteps,
			});
		} else {
			updateDoc(docRef, {
				nextSteps: " ",
			});
		}

		if (projectTitle != "") {
			updateDoc(docRef, {
				projectTitle: projectTitle,
			});
		} else if (projectExperiment.projectTitle != "") {
			updateDoc(docRef, {
				projectTitle: projectExperiment.projectTitle,
			});
		} else {
			updateDoc(docRef, {
				projectTitle: " ",
			});
		}

		//Note that projectUserID can't be changed by the user so it is not included here
		if (protocolNameDateVersion != "") {
			updateDoc(docRef, {
				protocolNameDateVersion: protocolNameDateVersion,
			});
		} else if (projectExperiment.protocolNameDateVersion != "") {
			updateDoc(docRef, {
				protocolNameDateVersion: projectExperiment.protocolNameDateVersion,
			});
		} else {
			updateDoc(docRef, {
				protocolNameDateVersion: " ",
			});
		}

		if (results != "") {
			updateDoc(docRef, {
				results: results,
			});
		} else if (projectExperiment.results != "") {
			updateDoc(docRef, {
				results: projectExperiment.results,
			});
		} else {
			updateDoc(docRef, {
				results: " ",
			});
		}

		console.log(" save and document = ", projectExperiment);

		setMessages("Changes saved for this project...");
		changeSaveButtonOff();
	};

	function changeSaveButtonOn() {
		//var r = document.querySelectorAll(':root');
		setSaveButton("Save");
	}

	function changeSaveButtonTest() {
		//select-shareable-input

		console.log("in Change Save Button Test");
		//console.log(
		//  " get shareable by id = ",
		//  document.getElementById("select-shareable-input").value
		//);
		console.log(
			"experimentDataDescriptionInput = ",
			experimentDataDescriptionInput
		);
		console.log("experimentDataShareableInput = ", experimentDataShareableInput);
		//console.log("selectedFile.name = ", selectedFile.name);
		let counter = 0;
		if (experimentDataDescriptionInput !== "") {
			counter++;
		}
		if (experimentDataShareableInput !== "") {
			counter++;
		}
		if (selectedFile !== null) {
			counter++;
		}

		if (counter >= 2) {
			setUploadButtonDisabled(false);
			setUploadButton("Upload");
			//changeSaveButtonOn();
			//let tempArray = experimentDataDescription;
			//tempArray.push(experimentDataDescriptionInput);
			//setExperimentDataDescription(tempArray);
			//tempArray = experimentDataShareable;
			//tempArray.push(experimentDataShareableInput);
			//setExperimentDataShareable(tempArray);
			console.log("selectedFile.name = ", selectedFile.name);
			console.log("experimentDataShareable", experimentDataShareable);
			console.log("experimentDataDescription", experimentDataDescription);
			setMessages(
				"Now press the Upload button to upload file and save its description and shareable options"
			);
		} else {
			setMessages(
				"You must select a file, fill in its description, and add its shareable options then you can upload"
			);
			console.log("if failed...");
		}
	}

	function changeSaveButtonOff() {
		//var r = document.querySelectorAll(':root');
		setSaveButton("");
	}

	const URLSelected = (e: ChangeEvent<HTMLSelectElement>) => {
		//  const [dataFileSelectIndex, setDataFileSelectIndex] = useState(0);
		console.log("in URLSelected...");
		console.log("value from selected event = ", e.currentTarget.selectedIndex);

		const tempIndex = e.currentTarget.selectedIndex;
		setDataFileSelectIndex(tempIndex - 1);
		console.log("index = ", tempIndex);
		console.log("index as set = ", dataFileSelectIndex);
		console.log(" experimentDataDescription = ", experimentDataDescription);
		console.log(
			" experimentDataDescription at index = ",
			experimentDataDescription[tempIndex - 1]
		);
		setExperimentDataDescriptionInput(experimentDataDescription[tempIndex - 1]);
		setExperimentDataShareableInput(experimentDataShareable[tempIndex - 1]);
		//experimentDataShareableInput = experimentDataShareable[tempIndex - 1];
		console.log(" experimentDataDescription = ", experimentDataDescription);
		console.log(" experimentDataFileName = ", experimentDataFileName);

		console.log(" experimentDataShareable = ", experimentDataShareable);

		console.log("before selectedShareableValue = ", selectedShareableValue);
		console.log(
			"before experimentDataShareable[tempIndex - 1] = ",
			experimentDataShareable
		);
		//selectedShareableValue = "No";
		console.log("after selectedShareableValue = ", selectedShareableValue);
		setRemoveButton("Remove");
		setRemoveButtonDisabled(false);
	};

	function getSelect(e: ChangeEvent<HTMLSelectElement>) {
		console.log("selectedValue = ", e);
		//const temp = e.currentTarget.selectedIndex;
		let temp = e;
		let tempValue = "No";
		if (temp === "Yes") {
			tempValue = "Yes";
		} else if (temp === "WithConsent") {
			tempValue = "With Consent";
		}

		//experimentDataShareable[tempIndex - 1] = tempValue;
		//experimentDataShareableInput = tempValue;
		//setExperimentDataShareableInput(tempValue);
		//experimentDataShareableInput = tempValue;
		setExperimentDataShareableInput(tempValue);
		//window.location.reload();
		console.log("temp value for shareable = ", tempValue);
		console.log("experimentDataShareableInput = ", experimentDataShareableInput);
		//changeSaveButtonTest();
		//experimentDataDescription.pop();
		//experimentDataFileName.pop();
		//experimentDataShareable.pop();
		//setDataShare(selectObject);
		//console.log("selected value = ", dataShare);
	}

	//**The following code is wrong to do a push */
	//Here is where we reread the projectExperiments to load the experimentData
	//array mapping from which to extract: dataDescription, dataFileName, and dataSharable
	//parameter

	console.log("tempUser = ", tempUser);
	console.log("experimentTitle = ", prjTitle);
	const q0 = query(
		collection(db, "projectProfiles"),
		where("title", "==", prjTitle),
		where("usersUID", "array-contains", tempUser)
	);
	//const q0 = query(collection(db, "projectProfiles"));
	useEffect(
		() =>
			onSnapshot(q0, (snapshot) => {
				setProjectProfiles(
					snapshot.docs.map((doc) => {
						//console.log("project = ", doc.data());
						//adminUID = doc.data().administratorUID;
						console.log("adminUID = ", doc.data().administratorUID);
						console.log("usersUID = ", doc.data().usersUID);
						console.log("title = ", doc.data().title);
						//title = doc.data().title;
						adminUID = doc.data().administratorUID;
						return {
							id: doc.id,
							...doc.data(),
						};
						//return {};
					})
				);
			}),
		[]
	);

	console.log("firstTime = ", localStorage.getItem("firstTime"));
	if (localStorage.getItem("firstTime") === "Yes") {
		if (projectExperiment.experimentData !== undefined) {
			for (let j = 0; j < projectExperiment.experimentData.length; j++) {
				console.log("projectExperiment id = ", projectExperiment.id);
				for (const [key, value] of Object.entries(
					projectExperiment.experimentData[j]
				)) {
					if (key === "dataDescription") {
						console.log("dataDescription = ", value);
						experimentDataDescription.push(value as string);
					} else if (key === "dataFileName") {
						experimentDataFileName.push(value as string);
					} else if (key === "dataShareable") {
						experimentDataShareable.push(value as string);
					}
				}
			}
		} else {
			//Call function to rewrite/update old experiment format documents
			UpdateOldExperimentFormats(projectExperiment.id);
		}
		experimentsCounter++;
		if (experimentsCounter == numberOfExperiments) {
			localStorage.setItem("firstTime", "No");
		}
	}

	//console.log("projectProfiles = ", projectProfiles);
	console.log("adminUID = ", adminUID);
	const q1 = query(collection(db, "Groups"));
	//const q1 = query(
	//  collection(db, "Groups"),
	//  where("administratorUID", "==", adminUID)
	//);
	useEffect(
		() =>
			onSnapshot(q1, (snapshot) => {
				setGroupProfiles(
					snapshot.docs.map((doc) => {
						if (adminUID === doc.data().administratorUID) {
							console.log("adminUID =  ", doc.data().administratorUID);
							console.log("adminEmail =  ", doc.data().administratorEmail);
							console.log("title = ", doc.data().title);
							title = doc.data().title;
							adminEmail = doc.data().administratorEmail;
						}

						return {
							id: doc.id,
							...doc.data(),
						};
					})
				);
			}),
		[]
	);

	//console.log("groupProfiles[0] =  ", groupProfiles[0]);
	//console.log("adminEmail =  ", adminEmail);
	//console.log("title =  ", title);
	//if (projectExperiment.signatureRequested === "no") {
	//  setRequestButtonDisabled(false);
	//setRequest("Request");
	//} else {
	//  setRequestButtonDisabled(true);
	//setRequest("Requested");
	//}
	//console.log(
	//  "in information and signatureRequested = ",
	//  projectExperiment.signatureRequested
	//);

	return (
		<>
			<div className={styles.wrapper}>
				<div className={styles.top}>
					<h1 className={styles.header}>Experiments</h1>

					<button className={styles.closeButton} onClick={() => history.back()}>
						Return
					</button>
					<button
						className={styles.copyButtonClass}
						id="copy-button"
						onClick={() => {
							copyButtonFunction(projectExperiment);
						}}
					>
						{copyButton}
					</button>
					<button
						className={styles.buttonClass}
						onClick={() => {
							pasteButtonFunction(projectExperiment);
						}}
					>
						{pasteButton}
					</button>
					<button
						className={styles.buttonClass}
						onClick={() => {
							deleteButtonFunction(projectExperiment);
						}}
					>
						{deleteButton}
					</button>

					<button
						className={styles.buttonClass}
						onClick={() =>
							saveExperimentChanges(
								aim,
								collaborator,
								commentsAndAnalysis,
								experimentTitle,
								methodology,
								nextSteps,
								pdfFileURL,
								projectTitle,
								protocolNameDateVersion,
								results,
								signatureRequested
							)
						}
					>
						{saveButton}
					</button>
				</div>
				<div className={styles.initialSpacing}>
					<label>Instructions&emsp;</label>
					<input
						className={styles.messageText}
						type="text"
						readOnly
						value={messages}
						style={{ paddingLeft: 3, height: 20, marginLeft: 41, width: 702 }}
					/>
				</div>
				<div>
					<button onClick={() => setRecord((prev) => !prev)}>
						{record ? "Disable Speech to text" : "Enable Speech to text"}
					</button>
				</div>
				<div className={styles.initialSpacing}>
					<label>Project Title&emsp;</label>
					<input
						style={{ paddingLeft: 3, height: 20, marginLeft: 39, width: 702 }}
						type="text"
						required
						defaultValue={projectExperiment.projectTitle}
						onChange={(e) => {
							setProjectTitle(e.target.value);
							changeSaveButtonOn();
						}}
					/>
				</div>
				<div>
					<label className={styles.userLabel}>Experiment Title&emsp;</label>
					<input
						style={{ paddingLeft: 3, height: 20, marginLeft: 15 }}
						type="text"
						size={50}
						inputMode="none"
						defaultValue={projectExperiment.experimentTitle}
						onChange={(e) => {
							setExperimentTitle(e.target.value);
							changeSaveButtonOn();
						}}
					/>
					<label>&emsp;&emsp;&emsp;Date</label>
					<input
						style={{ paddingLeft: 3, marginLeft: 115, width: 107 }}
						className={styles.userEmail}
						type="text"
						readOnly
						inputMode="none"
						defaultValue={projectExperiment.experimentDate}
						onChange={(e) => {
							setExperimentDate(e.target.value);
							changeSaveButtonOn();
						}}
					/>
				</div>
				<div className={styles.userLabel}>
					<label>Experimenter</label>
					<input
						style={{ paddingLeft: 3, marginLeft: 50 }}
						size={20}
						className={styles.projectExperimenter}
						type="text"
						readOnly
						inputMode="none"
						defaultValue={userProfileName}
					/>
					<label style={{ paddingLeft: 297 }}>Collaborator&emsp;</label>
					<input
						style={{ paddingLeft: 3, height: 20, marginLeft: 47, width: 107 }}
						type="text"
						size={21}
						defaultValue={projectExperiment.collaborator}
						onChange={(e) => {
							setCollaborator(e.target.value);
							changeSaveButtonOn();
						}}
					/>
				</div>
				<div>
					<label className={styles.signedLabel}>Has Been Signed</label>
					<input
						className={styles.userEmail}
						style={{ paddingLeft: 3 }}
						size={7}
						type="text"
						defaultValue={projectExperiment.signed}
						readOnly
						inputMode="none"
					/>

					<label style={{ paddingLeft: 327 }}>Signature Request&emsp;</label>
					<button
						disabled={requestButtonDisabled}
						type="button"
						style={{ marginTop: 7, marginLeft: 11 }}
						className={styles.dataSubmitButton}
						onClick={handleRequestClick}
					>
						{requestSignature}
					</button>
				</div>
				<div className={styles.aimLabel}>
					<label>Aim/Goal&emsp;</label>
					<textarea
						ref={AMIRef}
						style={{ paddingLeft: 3, marginLeft: 60, width: 677 }}
						rows={4}
						cols={50}
						defaultValue={projectExperiment.aim}
						value={aim}
						onMouseEnter={() => startListening()}
						onMouseLeave={() => stopListening()}
						onChange={(e) => {
							handleTextChange(e);
							changeSaveButtonOn();
						}}
						onFocus={() => handleTextareaFocus(AMIRef)}
					/>
				</div>
				<div className={styles.aimLabel}>
					<label>Methodology&emsp;</label>
					<textarea
						ref={MethodologyRef}
						style={{ paddingLeft: 3, marginLeft: 33, width: 677 }}
						rows={7}
						cols={70}
						defaultValue={projectExperiment.methodology}
						value={methodology}
						onMouseEnter={() => startListening()}
						onMouseLeave={() => stopListening()}
						onChange={(e) => {
							changeSaveButtonOn();
							handleTextChange(e);
						}}
						onFocus={() => handleTextareaFocus(MethodologyRef)}
					/>
				</div>
				<div className={styles.aimLabel}>
					<label>Protocol&emsp;</label>
					<textarea
						ref={ProtocolNameDateVersionRef}
						style={{ paddingLeft: 3, height: 20, marginLeft: 66, width: 677 }}
						rows={1}
						cols={70}
						defaultValue={projectExperiment.protocolNameDateVersion}
						value={protocolNameDateVersion}
						onMouseEnter={() => startListening()}
						onMouseLeave={() => stopListening()}
						onChange={(e) => {
							changeSaveButtonOn();
							handleTextChange(e);
						}}
						onFocus={() => handleTextareaFocus(ProtocolNameDateVersionRef)}
					/>
				</div>
				<div className={styles.aimLabel}>
					<label>Results&emsp;</label>
					<textarea
						ref={ResultsRef}
						style={{ paddingLeft: 3, marginLeft: 71, width: 677 }}
						rows={4}
						cols={70}
						defaultValue={projectExperiment.results}
						value={results}
						onMouseEnter={() => startListening()}
						onMouseLeave={() => stopListening()}
						onChange={(e) => {
							changeSaveButtonOn();
							handleTextChange(e);
						}}
						onFocus={() => handleTextareaFocus(ResultsRef)}
					/>
				</div>
				<div className={styles.aimLabel}>
					<label>Comments&emsp;</label>
					<textarea
						ref={CommentsAndAnalysisRef}
						style={{ paddingLeft: 3, marginLeft: 46, width: 677 }}
						rows={4}
						cols={50}
						defaultValue={projectExperiment.commentsAndAnalysis}
						value={commentsAndAnalysis}
						onMouseEnter={() => startListening()}
						onMouseLeave={() => stopListening()}
						onChange={(e) => {
							changeSaveButtonOn();
							handleTextChange(e);
						}}
						onFocus={() => handleTextareaFocus(CommentsAndAnalysisRef)}
					/>
				</div>
				<div className={styles.aimLabel}>
					<label>Next Steps&emsp;</label>
					<textarea
						ref={NextStepsRef}
						style={{ paddingLeft: 3, marginLeft: 46, width: 597 }}
						rows={3}
						cols={50}
						defaultValue={projectExperiment.nextSteps}
						value={nextSteps}
						onMouseEnter={() => startListening()}
						onMouseLeave={() => stopListening()}
						onChange={(e) => {
							changeSaveButtonOn();
							handleTextChange(e);
						}}
						onFocus={() => handleTextareaFocus(NextStepsRef)}
					/>
					<label style={{ marginLeft: 9 }}>&emsp;Shareable Options&emsp;</label>
					<select
						className={styles.shareable}
						name="select-shareable"
						id="select-shareable"
						style={{ marginLeft: 0, paddingLeft: 3, height: 22 }}
						//value={selectedShareableValue}
						//...value={projectExperiment.dataShare}
						onChange={(e) => {
							getSelect(e.target.value);
							changeSaveButtonTest();
						}}
					>
						<option value="Option">Selections</option>
						<option value="No">No</option>
						<option value="Yes">Yes</option>
						<option value="WithConsent">With Consent</option>
					</select>
				</div>

				<div className={styles.descriptionLabel}>
					<label>Local Data File&emsp;</label>
					{/* experimentDataFileName and this needs to be a listbox */}
					<select
						name="Data URL"
						id="URL-select"
						size={experimentDataFileName.length + 1}
						style={{ marginLeft: 37 }}
						onChange={URLSelected}
					>
						<option value="">-- Data File Selection --</option>
						{experimentDataFileName.map((experimentDataFileName, key) => (
							<option key={key} value={experimentDataFileName}>
								{experimentDataFileName}
							</option>
						))}
					</select>

					<label>&emsp;Data Description&emsp;</label>
					<textarea
						ref={ExperimentDataDescriptionInputRef}
						style={{
							paddingLeft: 3,
							height: 22,
						}}
						rows={1}
						cols={50}
						defaultValue={projectExperiment.experimentDataDescriptionInput}
						value={experimentDataDescriptionInput}
						onMouseEnter={() => startListening()}
						onMouseLeave={() => stopListening()}
						onChange={(e) => {
							changeSaveButtonTest();
							handleTextChange(e);
						}}
						onFocus={() => handleTextareaFocus(ExperimentDataDescriptionInputRef)}
					/>
					<label>&emsp;Shareable&emsp;</label>
					<textarea
						ref={SharableRef}
						name="select-shareable-input"
						id="select-shareable-input"
						style={{ paddingLeft: 3, height: 22 }}
						rows={1}
						cols={13}
						readOnly
						onMouseEnter={() => startListening()}
						onMouseLeave={() => stopListening()}
						value={experimentDataShareableInput}
						onChange={(e) => {
							changeSaveButtonTest();
							handleTextChange(e);
						}}
						onFocus={() => handleTextareaFocus(SharableRef)}
					/>
				</div>
				<div>
					<div className={styles.input_container}>
						<input
							style={{ marginTop: 4, marginBottom: 4, width: 300 }}
							type="file"
							name="myfile"
							size={80}
							id="myfile"
							onChange={handleFileChange}
						/>
						<button
							disabled={uploadButtonDisabled}
							type="button"
							style={{ marginTop: 7, marginLeft: 170 }}
							className={styles.dataSubmitButton}
							onClick={handleUploadClick}
						>
							{uploadButton}
						</button>
						<button
							type="button"
							disabled={removeButtonDisabled}
							style={{ marginLeft: 50, marginTop: 7 }}
							className={styles.dataSubmitButton}
							onClick={handleRemoveClick}
						>
							{removeButton}
						</button>
					</div>
				</div>
			</div>
			<br></br>
		</>
	);
}

export default ExperimentInformation;
