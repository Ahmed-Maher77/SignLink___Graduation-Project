import React from "react";

const FloatingGear = ({ onClick }) => {
	const styles = {
		container: {
			position: "fixed",
			bottom: "65px",
			right: "20px",
			width: "50px",
			height: "50px",
			borderRadius: "50%",
			backgroundColor: "#ffffff",
			boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			cursor: "pointer",
			transition: "all 0.3s ease",
			zIndex: 1000,
			":hover": {
				transform: "rotate(45deg)",
				boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
			},
		},
		icon: {
			width: "24px",
			height: "24px",
			color: "#2c3e50",
		},
	};

	return (
		<div
			style={styles.container}
			onClick={onClick}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = "rotate(45deg)";
				e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = "rotate(0deg)";
				e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
			}}
		>
			<svg
				style={styles.icon}
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
			</svg>
		</div>
	);
};

export default FloatingGear;
