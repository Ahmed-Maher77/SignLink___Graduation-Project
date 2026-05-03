import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { setCallId, setComingFrom_CallPage, setUserType } from "../../utils/redux-toolkit/webrtcSlice";
import { firestore } from "../../utils/firebase-config";
import { doc, getDoc } from "firebase/firestore";

const ControlMeeting_Btn = ({ title, type, isCameraOn, startWebcam, stopWebcam }) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

    // Start new Call
	const startCall = async () => {
		try {
			if (isCameraOn) {
                // Set user as the call creator and navigate to the call page
				dispatch(setUserType("creator"));
				stopWebcam();
                dispatch(setComingFrom_CallPage(false));
				navigate(`/call`);
			} else {
				// Prompt user to enable camera if it's off
                const result = await Swal.fire({
                    title: "Camera Required",
                    text: "You need to enable your camera to start the call.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Open Camera & Start Call",
                    cancelButtonText: "Cancel",
                });

                if (result.isConfirmed) {
                    await startWebcam();
                    dispatch(setUserType("creator"));
                    stopWebcam();
                    dispatch(setComingFrom_CallPage(false));
                    navigate(`/call`);
                }
			}
		} catch (error) {
			Swal.fire("Error", "Failed to start call", "error");
		}
	};

    // Join an existing call
	const joinCall = async () => {
        try {
            if (isCameraOn) {
                await handleJoinCall();
            } else {
                // Prompt user to enable camera if it's off
                const result = await Swal.fire({
                    title: "Camera Required",
                    text: "You need to enable your camera to join the call.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Open Camera & Join Call",
                    cancelButtonText: "Cancel",
                });

                if (result.isConfirmed) {
                    await startWebcam();
                    await handleJoinCall();
                }
            }
        } catch (error) {
            Swal.fire("Error", "Failed to join call", "error");
        }
    };

    // handle the logic of joining a call
	const handleJoinCall = async () => {
        // Prompt user to enter the call ID
        const { value: callId } = await Swal.fire({
            title: "Enter Call ID",
            input: "text",
            inputPlaceholder: "Enter the call ID",
            showCancelButton: true,
            confirmButtonText: "Join",
            cancelButtonText: "Cancel",
            preConfirm: (callId) => {
                if (!callId) Swal.showValidationMessage("Call ID is required");
                return callId;
            },
        });

        if (callId) {
            // Check if the call ID exists in Firestore
            const callDoc = doc(firestore, "calls", callId);
            const callDocSnapshot = await getDoc(callDoc);
            
            if (!callDocSnapshot.exists()) {
                Swal.fire("Invalid Call ID", "No call exists with this ID!", "warning");
                return;
            }

            // Set user as a guest and navigate to the call page
            dispatch(setUserType("guest"));
            dispatch(setCallId(callId));
            stopWebcam();
            dispatch(setComingFrom_CallPage(false));
            navigate(`/call`);
        }
    };

    // handle button click based on type
	const handleClick = () => {
		if (type === "main") {
			startCall();
		} else if (type === "blue") {
			joinCall();
		}
	};

	return (
		<button
			type="button"
			className={`control-meeting-btn trans-3 font-medium p-3 px-5 text-lg white-c rounded-md flex items-center gap-3 ${type}`}
			onClick={handleClick}
		>
			{title}
			<span
				className={`${
					type === "main"
						? "fa-solid fa-phone-volume"
						: "fa-solid fa-right-to-bracket"
				} mt-[1px]`}
			></span>
		</button>
	);
};

export default ControlMeeting_Btn;
