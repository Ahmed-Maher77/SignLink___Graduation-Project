import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import "./SpeechToTextButton.scss";
import Swal from "sweetalert2";

const SpeechToTextButton = ({
    onTranscriptUpdate,
    onEndOfSpeechTranscript,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const isListeningRef = useRef(false);
    const stoppingRef = useRef(false); // track if stop is in progress
    const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
    const onEndOfSpeechTranscriptRef = useRef(onEndOfSpeechTranscript);

    // Update refs when props change
    useEffect(() => {
        onTranscriptUpdateRef.current = onTranscriptUpdate;
    }, [onTranscriptUpdate]);

    useEffect(() => {
        onEndOfSpeechTranscriptRef.current = onEndOfSpeechTranscript;
    }, [onEndOfSpeechTranscript]);

    useEffect(() => {
        // Update ref whenever isListening changes
        isListeningRef.current = isListening;
    }, [isListening]);

    // Check browser support
    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            console.warn("Web Speech API not supported in this browser");
            Swal.fire({
                title: "Error",
                text: "Web Speech API not supported in this browser. Please use a supported browser (ex: Chrome, Edge).",
                icon: "error",
            });
            return;
        }
        setIsSupported(true);
    }, []);

    // Initialize speech recognition
    useEffect(() => {
        if (!isSupported) return;

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.onresult = (event) => {
            // Clear any existing silence timeout
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }

            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Send current transcript to parent
            if (onTranscriptUpdateRef.current) {
                const currentTranscript = finalTranscript + interimTranscript;
                if (currentTranscript.trim()) {
                    onTranscriptUpdateRef.current(currentTranscript);
                }
            }

            // Set timeout to clear subtitles after 5 seconds of silence
            silenceTimeoutRef.current = setTimeout(() => {
                if (onTranscriptUpdateRef.current) {
                    onTranscriptUpdateRef.current("");
                }
                // Notify that speech transcript has ended
                if (onEndOfSpeechTranscriptRef.current) {
                    onEndOfSpeechTranscriptRef.current(true);
                }
            }, 5000);
        };

        recog.onerror = (e) => {
            // Ignore "aborted" errors as they are normal when stopping recognition
            if (e.error === "aborted") {
                console.log(
                    "Speech recognition aborted (normal when stopping)"
                );
                return;
            }

            console.error("STT error:", e);

            // Show user-friendly error for other types of errors
            if (e.error === "not-allowed") {
                Swal.fire({
                    title: "Microphone Access Denied",
                    text: "Please allow microphone access to use speech-to-text features.",
                    icon: "error",
                });
                setIsListening(false);
                isListeningRef.current = false;
            } else if (e.error === "network") {
                Swal.fire({
                    title: "Network Error",
                    text: "Speech-to-text is unavailable. Your browser may not support this feature or you may be offline.",
                    icon: "error",
                });
                setIsListening(false);
                isListeningRef.current = false;
            } else if (e.error === "no-speech") {
                // This is normal when no speech is detected, no need to show error
                console.log("No speech detected");
            } else {
                Swal.fire({
                    title: "Speech Recognition Error",
                    text: "An error occurred with speech recognition. Please try again.",
                    icon: "error",
                });
                setIsListening(false);
                isListeningRef.current = false;
            }
        };

        recog.onend = () => {
            console.log(
                "Speech recognition ended, isListening:",
                isListeningRef.current,
                "stopping:",
                stoppingRef.current
            );
            // Only restart automatically if still listening and not stopping
            if (isListeningRef.current && !stoppingRef.current) {
                console.log("Restarting speech recognition...");
                setTimeout(() => {
                    try {
                        recog.start();
                    } catch (err) {
                        console.error(
                            "Error restarting speech recognition:",
                            err
                        );
                        setIsListening(false);
                        isListeningRef.current = false;
                    }
                }, 100);
            } else {
                console.log("Not restarting - listening was stopped");
            }
            stoppingRef.current = false; // Always reset after onend
        };

        recognitionRef.current = recog;

        // Cleanup function
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (err) {
                    console.log(
                        "Error stopping recognition during cleanup:",
                        err
                    );
                }
            }
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
        };
    }, [isSupported]);

    const startListening = useCallback(() => {
        if (!isSupported) {
            Swal.fire({
                title: "Not Supported",
                text: "Speech recognition is not supported in this browser.",
                icon: "error",
            });
            return;
        }

        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                isListeningRef.current = true;
                console.log("Speech recognition started - Start speaking now!");
            } catch (err) {
                console.error("Error starting speech recognition:", err);
                Swal.fire({
                    title: "Error",
                    text: "Unable to start speech recognition. Please ensure your microphone is connected and try again.",
                    icon: "error",
                });
                setIsListening(false);
                isListeningRef.current = false;
            }
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        // Set listening to false immediately to prevent auto-restart
        setIsListening(false);
        isListeningRef.current = false;
        stoppingRef.current = true; // mark stop in progress

        if (recognitionRef.current) {
            try {
                // Clear any pending silence timeout
                if (silenceTimeoutRef.current) {
                    clearTimeout(silenceTimeoutRef.current);
                    silenceTimeoutRef.current = null;
                }

                // Stop the recognition
                recognitionRef.current.stop();

                // Clear subtitles immediately when stopping
                if (onTranscriptUpdateRef.current) {
                    onTranscriptUpdateRef.current("");
                }
                // Notify that speech transcript has ended
                if (onEndOfSpeechTranscriptRef.current) {
                    onEndOfSpeechTranscriptRef.current(true);
                }

                console.log("Speech recognition stopped");
            } catch (err) {
                console.log("Error stopping speech recognition:", err);
                // Don't show error for stopping - it's usually just an "aborted" error
            }
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (err) {
                    console.log(
                        "Error stopping recognition during unmount:",
                        err
                    );
                }
            }
        };
    }, []);

    if (!isSupported) {
        return (
            <div className="speech-to-text-button">
                <button
                    className="mic-button disabled"
                    disabled
                    title="Speech recognition not supported in this browser"
                >
                    <FaMicrophone />
                </button>
            </div>
        );
    }

    return (
        <div className="speech-to-text-button">
            <button
                className={`mic-button ${isListening ? "listening" : ""}`}
                onClick={toggleListening}
                title={
                    isListening
                        ? "Click to stop recording"
                        : "Click to start listening and convert speech to text"
                }
            >
                {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            {isListening && (
                <div className="listening-indicator">Listening...</div>
            )}
        </div>
    );
};

export default SpeechToTextButton;
