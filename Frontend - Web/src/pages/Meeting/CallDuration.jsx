import { FaClock } from "react-icons/fa";

export const CallDuration = ({ startTime, currentTime }) => {
	// Format call duration (HH:MM:SS)
	const formatDuration = (durationMs) => {
		const totalSeconds = Math.floor(durationMs / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
			2,
			"0"
		)}:${String(seconds).padStart(2, "0")}`;
	};

	return (
		<div className="call-duration">
			<FaClock />
			<span>{formatDuration(currentTime - startTime.getTime())}</span>
		</div>
	);
};
