import { useEffect, useState } from "react";
import {
	FaVideo,
	FaVideoSlash,
	FaMicrophone,
	FaMicrophoneSlash,
	FaDesktop,
	FaSignOutAlt,
} from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";

export const ToggleCameraButton = ({ isOn, onClick }) => (
	<button onClick={onClick} className={`icon-button camera-btn ${!isOn ? "closed-camera" : ""}`} title={isOn ? "Open Camera" : "Close Camera"}>
		{isOn ? <FaVideo /> : <FaVideoSlash />}
	</button>
);

export const ToggleAudioButton = ({ isMuted, onClick }) => (
	<button onClick={onClick} className={`icon-button audio-btn ${isMuted ? "muted" : ""}`} title={isMuted ? "Unmuted" : "Mute"}>
		{isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
	</button>
);

export const ScreenShareButton = ({ isSharing, onClick }) => {
    const [isTinyScreen, setIsTinyScreen] = useState(window.innerWidth < 340);
    
    // check if the screen is tiny (< 340px)
    const handleResize = () => {
        setIsTinyScreen(window.innerWidth < 340);
    };
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <button onClick={onClick} className={`share-screen ${isSharing ? "active" : ""}`} title={isSharing ? "Stop Sharing" : "Share Screen"}>
            {isSharing ? (
                <span>Stop <span className="max-sm:hidden">Sharing</span></span>
            ) : (
                !isTinyScreen && (
                    <span>Share <span className="max-sm:hidden">Screen</span></span>
                )
            )}{" "}
            <span className="icon"><FaDesktop /></span>
        </button>
    );
};

export const EndCallButton = ({ onClick, isLoading = false }) => (
	<button 
		onClick={onClick} 
		className="end-call-button icon-button" 
		title="End Call"
		disabled={isLoading}
	>
		{isLoading ? (
			<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
		) : (
			<span className="rotate-[-145deg]">
				<MdCallEnd />
			</span>
		)}
	</button>
);

export const LeaveCallButton = ({ onClick, isLoading = false }) => (
	<button 
		onClick={onClick} 
		className="icon-button leave-call-button" 
		title="Leave Call"
		disabled={isLoading}
	>
		{isLoading ? (
			<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
		) : (
			<FaSignOutAlt />
		)}
	</button>
);
