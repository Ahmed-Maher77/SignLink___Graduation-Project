import React, { useEffect, useRef, useState } from "react";
import VideoFeed from "./VideoFeed";
import ProgressBar from "./ProgressBar";
import PredictionInfo from "./PredictionInfo";
import CorrectedSentence from "./CorrectedSentence";
import FloatingGear from "./FloatingGear";
import SettingsPopup from "./SettingsPopup";

const SignLanguageTranslator = () => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);

	const [topPrediction, setTopPrediction] = useState({
		label: "",
		probability: 0,
	});
	const [correctedSentence, setCorrectedSentence] = useState("");
	const [progress, setProgress] = useState({
		bufferPercentage: 0,
		delay: false,
		delayProgress: 0,
		queueSize: 0,
		targetSize: 0,
	});
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [connectionError, setConnectionError] = useState(null);
	const [socket, setSocket] = useState(null);
	const [sendIntervalId, setSendIntervalId] = useState(null);
	const [showPrediction, setShowPrediction] = useState(false);
	const retryTimeoutRef = useRef(null);

	const FRAME_INTERVAL_MS = Math.round(1000 / 30);
	const VIDEO_WIDTH = 640;
	const VIDEO_HEIGHT = 480;
	// const wsUrl = `ws://${window.location.hostname || "localhost"}:8000/ws`;
	const wsUrl = `ws://localhost:8000/ws`;
	const MAX_RETRIES = 3;
	const RETRY_DELAY = 2000; // 2 seconds

	const connectWebSocket = (retryCount = 0) => {
		if (retryCount >= MAX_RETRIES) {
			setConnectionError(
				"Failed to connect after multiple attempts. Please check if the server is running."
			);
			setIsConnecting(false);
			return;
		}

		setIsConnecting(true);
		setConnectionError(null);

		try {
			const newSocket = new WebSocket(wsUrl);
			newSocket.binaryType = "arraybuffer";

			newSocket.onopen = () => {
				console.log("WebSocket connected.");
				setIsConnected(true);
				setIsConnecting(false);
				setConnectionError(null);
				if (videoRef.current?.srcObject?.active) {
					const intervalId = setInterval(
						() => captureAndSendFrame(newSocket),
						FRAME_INTERVAL_MS
					);
					setSendIntervalId(intervalId);
				}
			};

			newSocket.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					console.log("Received data:", data);

					const top = data.top_k_predictions?.[0] || {
						label: "N/A",
						probability: 0,
					};
					setTopPrediction(top);
					setCorrectedSentence(data.corrected_sentence_text || "");

					setProgress({
						bufferPercentage: data.buffer_fill_percentage || 0,
						delay: data.is_in_delay,
						delayProgress: data.delay_progress || 0,
						queueSize: data.input_queue_actual_size || 0,
						targetSize: data.input_queue_target_clip_size || 0,
					});
				} catch (e) {
					console.error("Error processing message:", e);
				}
			};

			newSocket.onclose = () => {
				console.log("WebSocket disconnected.");
				setIsConnected(false);
				if (sendIntervalId) {
					clearInterval(sendIntervalId);
					setSendIntervalId(null);
				}

				// Only attempt retry if we're still trying to connect
				if (isConnecting && retryCount < MAX_RETRIES) {
					setConnectionError(
						`Connection failed. Retrying... (${retryCount + 1}/${MAX_RETRIES})`
					);
					retryTimeoutRef.current = setTimeout(() => {
						connectWebSocket(retryCount + 1);
					}, RETRY_DELAY);
				}
			};

			newSocket.onerror = (err) => {
				console.error("WebSocket error:", err);
				setIsConnected(false);
				setConnectionError(
					"Connection error. Please check if the server is running."
				);
			};

			setSocket(newSocket);
		} catch (err) {
			console.error("Error creating WebSocket:", err);
			setConnectionError("Failed to create WebSocket connection.");
			setIsConnecting(false);
		}
	};

	const disconnectWebSocket = () => {
		if (retryTimeoutRef.current) {
			clearTimeout(retryTimeoutRef.current);
			retryTimeoutRef.current = null;
		}
		if (socket) {
			socket.close();
			setSocket(null);
		}
		if (sendIntervalId) {
			clearInterval(sendIntervalId);
			setSendIntervalId(null);
		}
		setIsConnected(false);
		setIsConnecting(false);
		setConnectionError(null);
	};

	const handleToggleConnection = () => {
		if (isConnected) {
			disconnectWebSocket();
		} else {
			connectWebSocket();
		}
	};

	useEffect(() => {
		const setupCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: {
						width: VIDEO_WIDTH,
						height: VIDEO_HEIGHT,
						facingMode: "user",
					},
				});
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					videoRef.current.onloadedmetadata = () => {
						videoRef.current.play();
						canvasRef.current.width = videoRef.current.videoWidth;
						canvasRef.current.height = videoRef.current.videoHeight;
					};
				}
			} catch (err) {
				console.error("Error accessing webcam:", err);
			}
		};

		setupCamera();
		// Don't automatically connect on component mount
		// connectWebSocket();

		return () => {
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
			}
			if (sendIntervalId) clearInterval(sendIntervalId);
			if (socket) socket.close();
		};
	}, []);

	const captureAndSendFrame = (socket) => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		const video = videoRef.current;
		if (
			socket.readyState === WebSocket.OPEN &&
			video &&
			video.readyState >= 2
		) {
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			canvas.toBlob(
				(blob) => {
					if (blob) socket.send(blob);
				},
				"image/jpeg",
				0.85
			);
		}
	};

	const getConfidenceClass = (probability) => {
		if (probability > 50) return "pred-high";
		if (probability > 30) return "pred-mid";
		return "pred-low";
	};

	const scaledBuffer = (progress.bufferPercentage * 2) / 3;
	const scaledDelay = (progress.delayProgress * 100) / 3;
	const bufferWidth = progress.delay ? 0 : scaledBuffer;
	const delayWidth = progress.delay ? scaledDelay : 33.33;
	const progressText = progress.delay
		? `0% (Q: 0/${progress.targetSize})`
		: `${Math.round(progress.bufferPercentage)}% (Q: ${progress.queueSize}/${
				progress.targetSize
		  })`;

	return (
		<div style={styles.body}>
			{/* <h1 style={styles.h1}>Real-time Sign Language Translation</h1> */}
			<div style={styles.appContainer}>
				<div style={styles.leftColumn}>
					<div style={styles.videoFeedBox}>
						<VideoFeed
							videoRef={videoRef}
							canvasRef={canvasRef}
							VIDEO_WIDTH={VIDEO_WIDTH}
							VIDEO_HEIGHT={VIDEO_HEIGHT}
							styles={styles}
						/>
						<ProgressBar
							delayWidth={delayWidth}
							bufferWidth={bufferWidth}
							styles={styles}
						/>
					</div>
				</div>
				<div style={styles.rightColumn}>
					{showPrediction && (
						<PredictionInfo
							topPrediction={topPrediction}
							getConfidenceClass={getConfidenceClass}
							styles={styles}
						/>
					)}
					<CorrectedSentence
						correctedSentence={correctedSentence}
						styles={styles}
					/>
				</div>
			</div>
			<div style={styles.progressText}>{progressText}</div>
			<FloatingGear onClick={() => setIsSettingsOpen(true)} />
			<SettingsPopup
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				isConnected={isConnected}
				isConnecting={isConnecting}
				connectionError={connectionError}
				onToggleConnection={handleToggleConnection}
				showPrediction={showPrediction}
				onTogglePrediction={() => setShowPrediction(!showPrediction)}
			/>
		</div>
	);
};

const styles = {
	body: {
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
		margin: 0,
		padding: 20,
		backgroundColor: "#f4f6f8",
		color: "#333",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		minHeight: "100vh",
		lineHeight: 1.6,
		boxSizing: "border-box",
	},
	h1: {
		marginBottom: 20,
		color: "#2c3e50",
		fontWeight: 300,
		textAlign: "center",
		width: "100%",
	},
	appContainer: {
		display: "flex",
		flexDirection: "row",
		gap: 25,
		width: "100%",
		maxWidth: 1200,
		flexWrap: "wrap",
		justifyContent: "center",
	},
	leftColumn: {
		flex: 2,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		minWidth: 0,
		width: "100%",
		maxWidth: 700,
	},
	rightColumn: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: 15,
		minWidth: 320,
		maxWidth: 400,
		width: "100%",
	},
	videoFeedBox: {
		backgroundColor: "#ffffff",
		padding: 20,
		borderRadius: 12,
		boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
		width: "100%",
	},
	videoContainer: {
		position: "relative",
		width: "100%",
		paddingTop: "75%",
		backgroundColor: "#000",
		marginBottom: 15,
		borderRadius: 8,
		overflow: "hidden",
		boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
	},
	videoElement: {
		position: "absolute",
		top: 0,
		left: 0,
		display: "block",
		width: "100%",
		height: "100%",
		objectFit: "cover",
	},
	progressBarContainer: {
		width: "100%",
		height: 28,
		backgroundColor: "#e9ecef",
		borderRadius: 6,
		overflow: "hidden",
		marginTop: 10,
		position: "relative",
	},
	progressFill: {
		position: "absolute",
		top: 0,
		left: "33.33%",
		height: "100%",
		backgroundColor: "#17a2b8",
		transition: "none",
		zIndex: 1,
	},
	delayFill: {
		position: "absolute",
		top: 0,
		left: 0,
		height: "100%",
		backgroundColor: "#ffc107",
		transition: "none",
		zIndex: 1,
	},
	dividerLine: {
		position: "absolute",
		top: 0,
		left: "33.33%",
		width: 2,
		height: "100%",
		backgroundColor: "#000",
		zIndex: 2,
	},
	delayLabel: {
		position: "absolute",
		top: "50%",
		left: "16.67%",
		transform: "translate(-50%, -50%)",
		color: "#495057",
		fontSize: "0.9em",
		fontWeight: 500,
		zIndex: 3,
		pointerEvents: "none",
	},
	frameBufferLabel: {
		position: "absolute",
		top: "50%",
		left: "66.67%",
		transform: "translate(-50%, -50%)",
		color: "#495057",
		fontSize: "0.9em",
		fontWeight: 500,
		zIndex: 3,
		pointerEvents: "none",
	},
	infoBox: {
		backgroundColor: "#ffffff",
		padding: 20,
		borderRadius: 12,
		boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
		wordWrap: "break-word",
		display: "flex",
		flexDirection: "column",
	},
	progressText: {
		textAlign: "center",
		marginTop: 10,
		fontSize: "0.9em",
		color: "#495057",
		fontWeight: 500,
	},
};

export default SignLanguageTranslator;
