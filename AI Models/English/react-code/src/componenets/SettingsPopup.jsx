import React, { useEffect } from "react";
import Swal from "sweetalert2";
import "./SettingsPopup.css";

const SettingsPopup = ({
	isOpen,
	onClose,
	isConnected,
	isConnecting,
	connectionError,
	onToggleConnection,
	showPrediction,
	onTogglePrediction,
}) => {
	useEffect(() => {
		if (connectionError) {
			Swal.fire({
				title: "Connection Error",
				html: `
					<div style="text-align: left; margin-bottom: 20px;">
						<p style="margin-bottom: 15px;">We can't connect to the server.</p>
						<p>Please reach out to the SignLink Team to figure out the problem.</p>
					</div>
					<a href="https://www.linkedin.com/in/ahmed-maher-algohary" 
						target="_blank" 
						style="display: inline-flex; align-items: center; text-decoration: none; color: #0077b5;">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0077b5" style="margin-right: 8px;">
							<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
						</svg>
						Contact SignLink Team
					</a>
				`,
				icon: "error",
				confirmButtonText: "OK",
				confirmButtonColor: "#dc3545",
				customClass: {
					popup: "swal2-popup-custom",
					title: "swal2-title-custom",
					htmlContainer: "swal2-html-container-custom",
					confirmButton: "swal2-confirm-button-custom",
				},
			});
		}
	}, [connectionError]);

	if (!isOpen) return null;

	const styles = {
		overlay: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0, 0, 0, 0.5)",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			zIndex: 1000,
		},
		popup: {
			backgroundColor: "white",
			padding: "20px",
			borderRadius: "12px",
			boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
			width: "100%",
			maxWidth: "430px",
			position: "relative",
		},
		closeButton: {
			position: "absolute",
			top: "10px",
			right: "14px",
			background: "none",
			border: "none",
			fontSize: "30px",
			cursor: "pointer",
			color: "#666",
			padding: "5px",
			transition: "color 0.2s ease",
		},
		title: {
			margin: "0 0 30px 0",
			color: "#2c3e50",
			fontSize: "22px",
			fontWeight: "500",
		},
		connectionStatus: {
			display: "flex",
			alignItems: "center",
			marginBottom: "15px",
			padding: "10px",
			borderRadius: "8px",
			backgroundColor: "#f8f9fa",
			transition: "background-color 0.3s ease",
		},
		statusDot: {
			width: "12px",
			height: "12px",
			borderRadius: "50%",
			marginRight: "10px",
			backgroundColor: isConnecting
				? "#ffc107"
				: isConnected
				? "#28a745"
				: "#dc3545",
			transition: "background-color 0.3s ease",
		},
		statusText: {
			color: "#495057",
			fontSize: "15px",
		},
		errorMessage: {
			color: "#dc3545",
			fontSize: "14px",
			marginBlock: "5px",
			padding: "5px",
			backgroundColor: "#fff5f5",
			borderRadius: "4px",
			border: "1px solid #ffd7d7",
			animation: "slideIn 0.3s ease",
		},
		toggleButton: {
			width: "100%",
			padding: "10px",
			borderRadius: "6px",
			border: "none",
			backgroundColor: isConnected ? "#dc3545" : "#28a745",
			color: "white",
			fontSize: "14px",
			fontWeight: "500",
			cursor: isConnecting ? "not-allowed" : "pointer",
			opacity: isConnecting ? 0.7 : 1,
			transition: "all 0.3s ease",
		},
		toggleContainer: {
			marginTop: "40px",
			padding: "10px",
			borderRadius: "8px",
			backgroundColor: "#f8f9fa",
			opacity: isConnected ? 1 : 0.6,
		},
		toggleRow: {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: "5px",
		},
		toggleLabel: {
			color: "#495057",
			fontSize: "16px",
			opacity: isConnected ? 1 : 0.7,
		},
		toggleSwitch: {
			position: "relative",
			display: "inline-block",
			width: "45px",
			height: "22px",
			cursor: isConnected ? "pointer" : "not-allowed",
		},
		toggleInput: {
			opacity: 0,
			width: 0,
			height: 0,
		},
		toggleSlider: {
			position: "absolute",
			cursor: isConnected ? "pointer" : "not-allowed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "#ccc",
			transition: ".4s",
			borderRadius: "20px",
			opacity: isConnected ? 1 : 0.7,
		},
		toggleSliderBefore: {
			position: "absolute",
			content: '""',
			height: "15px",
			width: "15px",
			left: "4px",
			bottom: "3.4px",
			backgroundColor: "white",
			transition: ".4s",
			borderRadius: "50%",
			transform: showPrediction ? "translateX(20px)" : "translateX(0)",
		},
		toggleSliderActive: {
			backgroundColor: "#28a745",
		},
		disabledMessage: {
			fontSize: "12px",
			color: "#6c757d",
			marginTop: "5px",
			fontStyle: "italic",
		},
	};

	const getStatusText = () => {
		if (isConnecting) return "Connecting...";
		if (isConnected) return "Connected to Server";
		return "Disconnected from Server";
	};

	const getButtonText = () => {
		if (isConnecting) return "Connecting...";
		if (isConnected) return "Disconnect from Server";
		return "Connect to Server";
	};

	return (
		<div style={styles.overlay} onClick={onClose} className="settings-overlay">
			<div
				style={styles.popup}
				onClick={(e) => e.stopPropagation()}
				className="settings-popup"
			>
				<button
					style={styles.closeButton}
					onClick={onClose}
					className="settings-close-button"
				>
					×
				</button>
				<h3 style={styles.title}>Settings</h3>

				<div style={styles.connectionStatus}>
					<div style={styles.statusDot} />
					<span style={styles.statusText}>{getStatusText()}</span>
				</div>

				{connectionError && (
					<div style={styles.errorMessage}>{connectionError}</div>
				)}

				<button
					style={styles.toggleButton}
					onClick={onToggleConnection}
					disabled={isConnecting}
					className="settings-toggle-button"
				>
					{getButtonText()}
				</button>

				<div style={styles.toggleContainer}>
					<div style={styles.toggleRow}>
						<span style={styles.toggleLabel}>Show Top Prediction</span>
						<label style={styles.toggleSwitch}>
							<input
								type="checkbox"
								checked={showPrediction}
								onChange={onTogglePrediction}
								disabled={!isConnected}
								style={styles.toggleInput}
							/>
							<span
								style={{
									...styles.toggleSlider,
									...(showPrediction ? styles.toggleSliderActive : {}),
								}}
							>
								<span style={styles.toggleSliderBefore} />
							</span>
						</label>
					</div>
					{!isConnected && (
						<div style={styles.disabledMessage}>
							Connect to server to enable predictions
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SettingsPopup;
