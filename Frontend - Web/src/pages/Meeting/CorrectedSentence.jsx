import React, { useEffect, useState } from "react";

const CorrectedSentence = ({
    correctedSentence,
    speechTranscript,
    selectedFeature,
    endOfSpeechTranscript = false,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [lastContent, setLastContent] = useState("");

    // Debug logging
    // console.log("CorrectedSentence props:", {
    //     correctedSentence,
    //     speechTranscript,
    //     selectedFeature,
    // });

    const styles = {
        floatingBoxStyles: {
            position: "absolute",
            bottom: "10px",
            left: "50%",
            translate: "-50%",
            backgroundColor: "#fff",
            padding: "5px 11px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            border: "1px solid #e1e5e9",
            maxWidth: "450px",
            minWidth: "260px",
            zIndex: 1000,
            transform: isVisible ? "translateY(0)" : "translateY(100px)",
            opacity: isVisible ? 1 : 0,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            wordWrap: "break-word",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
        },
        speechBoxStyles: {
            position: "absolute",
            bottom: "10px",
            left: "50%",
            translate: "-50%",
            backgroundColor: "#e3f2fd",
            padding: "5px 11px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            border: "1px solid #2196f3",
            maxWidth: "450px",
            minWidth: "260px",
            zIndex: 1000,
            transform: isVisible ? "translateY(0)" : "translateY(100px)",
            opacity: isVisible ? 1 : 0,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            wordWrap: "break-word",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
        },
        titleStyles: {
            fontSize: "14px",
            fontWeight: "600",
            color: "#2c3e50",
            margin: "0",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        contentStyles: {
            fontSize: "17px",
            color: "#34495e",
            margin: "0",
            lineHeight: "1.5",
            fontWeight: "500",
        },
        speechContentStyles: {
            fontSize: "17px",
            color: "#1565c0",
            margin: "0",
            lineHeight: "1.5",
            fontWeight: "500",
        },
    };

    // Determine which content to show based on selected feature
    const getContent = () => {
        // console.log("getContent called with:", {
        //     selectedFeature,
        //     speechTranscript,
        //     correctedSentence,
        // });

        if (
            selectedFeature === "speechToText" &&
            speechTranscript &&
            speechTranscript.trim() !== ""
        ) {
            // console.log("Returning speech transcript:", speechTranscript);
            return speechTranscript;
        } else if (
            selectedFeature === "aiTranslator" &&
            correctedSentence &&
            correctedSentence.trim() !== ""
        ) {
            // console.log("Returning corrected sentence:", correctedSentence);
            return correctedSentence;
        }
        // console.log("No content to display");
        return null;
    };

    const content = getContent();

    // Store the last content when we have content
    useEffect(() => {
        if (content && content.trim() !== "") {
            setLastContent(content);
        }
    }, [content]);

    const isSpeechToText =
        selectedFeature === "speechToText" &&
        ((speechTranscript && speechTranscript.trim() !== "") ||
            (endOfSpeechTranscript &&
                lastContent &&
                lastContent.trim() !== ""));

    useEffect(() => {
        if (content && content.trim() !== "") {
            // Show the box when there's content
            setIsVisible(true);
        } else if (
            endOfSpeechTranscript &&
            selectedFeature === "speechToText"
        ) {
            // If end of speech is detected and we're in speech-to-text mode,
            // keep the box visible for 5 seconds before hiding
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 1500);

            // Cleanup timer if content changes before delay completes
            return () => clearTimeout(timer);
        } else {
            // Hide the box immediately for other cases
            setIsVisible(false);
        }
    }, [content, endOfSpeechTranscript, selectedFeature]);

    // useEffect(() => {
    //     console.log("endOfSpeechTranscript: ", endOfSpeechTranscript);
    // }, [endOfSpeechTranscript]);

    // Determine what content to display
    const displayContent =
        content ||
        (endOfSpeechTranscript && selectedFeature === "speechToText"
            ? lastContent
            : "");

    // Don't render anything if there's no content to display
    if (!displayContent || displayContent.trim() === "") {
        return null;
    }

    return (
        <div
            style={
                isSpeechToText
                    ? styles.speechBoxStyles
                    : styles.floatingBoxStyles
            }
        >
            <p
                style={
                    isSpeechToText
                        ? styles.speechContentStyles
                        : styles.contentStyles
                }
            >
                {displayContent}
            </p>
        </div>
    );
};

export default CorrectedSentence;
