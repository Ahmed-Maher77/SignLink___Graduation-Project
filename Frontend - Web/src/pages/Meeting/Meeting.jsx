import React, { useEffect, useRef, useState } from "react";
import SectionHeading from "../../components/Section_Heading/SectionHeading";
import Instructions from "./Instructions";
import ControlMeeting_Btn from "./ControlMeeting_Btn";
import Swal from "sweetalert2";
import "./Meeting.scss";

const Meeting = () => {
    const webcamVideoRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [localStream, setLocalStream] = useState(null);

    // ICE servers for WebRTC
    const servers = {
        iceServers: [
            {
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                ],
            },
        ],
    };

    // Start the webcam and microphone
    const startWebcam = async () => {
        setIsCameraLoading(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream); // Set the local stream
            webcamVideoRef.current.srcObject = stream; // Set the video source
            setIsCameraOn(true);
        } catch (error) {
            console.error("Error accessing media devices:", error);
            Swal.fire(
                "Permission Required",
                "Please allow camera/mic access",
                "error"
            );
        } finally {
            setIsCameraLoading(false);
        }
    };

    // Stop the webcam and microphone
    const stopWebcam = () => {
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop()); // Stop all tracks
            setLocalStream(null); // Clear the local stream
            webcamVideoRef.current.srcObject = null; // Clear the video source
            setIsCameraOn(false);
        }
    };

    // Toggle mute when camera state changes
    useEffect(() => {
        toggleMute();
    }, [isCameraOn]);

    // Toggle mute/unmute the microphone
    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled; // Toggle audio track
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    return (
        <div className="Meeting-Page flex flex-col gap-11 items-center bg-gray-100 p-6 pb-14 min-h-page">
            {/* ============= Page Heading ============= */}
            <SectionHeading title="Start a Call" className="mt-7 text-center" />

            <div className="container max-w-[780px] bg-white p-6 md:p-8 md:pb-6 rounded-xl shadow-md">
                <Instructions />

                <div>
                    {/* Divider */}
                    <div className="w-full mx-auto rounded-full h-[2px] bg-slate-400 mt-6"></div>
                    {/* ============= Camera and Microphone Section ============= */}
                    <div
                        className="bg-white p-5 rounded-lg w-full mt-6"
                        style={{ boxShadow: "0 0 5px 2px #0000001a" }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-center">
                            Open Camera and Microphone
                        </h2>

                        {/* ============= Local Video Stream ============= */}
                        <video
                            ref={webcamVideoRef}
                            autoPlay
                            playsInline
                            className={`w-full rounded-lg rounded-b-none ${
                                isCameraOn ? "block" : "hidden"
                            }`}
                            style={{ transform: "scaleX(-1)" }}
                        ></video>

                        {/* ============= Camera and Microphone Controls ============= */}
                        {isCameraOn && (
                            <div className="flex justify-center space-x-4 p-3 bg-gray-800 rounded-b-lg">
                                <button
                                    onClick={stopWebcam}
                                    className="flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                >
                                    <span>
                                        Close{" "}
                                        <span className="max-md:hidden">
                                            Camera
                                        </span>
                                    </span>
                                    <i className="fas fa-video-slash ms-2 mt-1"></i>
                                </button>
                                <button
                                    onClick={toggleMute}
                                    className={`flex items-center justify-center px-4 py-2 text-white rounded-lg ${
                                        isMuted
                                            ? "bg-gray-500 hover:bg-gray-600"
                                            : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                                >
                                    <i
                                        className={`fas ${
                                            isMuted
                                                ? "fa-microphone-slash"
                                                : "fa-microphone"
                                        }`}
                                    ></i>
                                </button>
                            </div>
                        )}

                        {/* ============= Open Camera Button ============= */}
                        {!isCameraOn && (
                            <div className="flex justify-center mt-10">
                                <button
                                    onClick={startWebcam}
                                    className="start-camera-btn flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                    disabled={isCameraLoading}
                                >
                                    <i className="fas fa-video mr-2"></i>
                                    Open Camera
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ============= Control Buttons for Starting/Joining Calls ============= */}
                    <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10 gap-y-2 justify-center mt-10 flex-wrap">
                        <ControlMeeting_Btn
                            title="Start Call"
                            aria-label="Start a new Call"
                            type="main"
                            isCameraOn={isCameraOn}
                            startWebcam={startWebcam}
                            stopWebcam={stopWebcam}
                        />
                        <ControlMeeting_Btn
                            title="Join Call"
                            aria-label="join an existing Call"
                            type="blue"
                            isCameraOn={isCameraOn}
                            startWebcam={startWebcam}
                            stopWebcam={stopWebcam}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Meeting;
