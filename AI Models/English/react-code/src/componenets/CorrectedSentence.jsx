import React, { useEffect, useState } from "react";

const CorrectedSentence = ({ correctedSentence }) => {
    const [isVisible, setIsVisible] = useState(false);

    const styles = {
        floatingBoxStyles: {
            position: "fixed",
            bottom: "85px",
            right: "50%",
            translate: "50%",
            backgroundColor: "#fff",
            padding: "11px 16px 16px 16px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            border: "1px solid #e1e5e9",
            maxWidth: "450px",
            minWidth: "300px",
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
        }
    };

    useEffect(() => {
        if (correctedSentence && correctedSentence.trim() !== "") {
            // Show the box when there's content
            setIsVisible(true);
        } else {
            // Hide the box when there's no content
            setIsVisible(false);
        }
    }, [correctedSentence]);


    // Don't render anything if there's no content
    if (!correctedSentence || correctedSentence.trim() === "") {
        return null;
    }

    return (
        <div style={styles.floatingBoxStyles}>
            {/* <h4 style={styles.titleStyles}>Corrected Sentence</h4> */}
            <p style={styles.contentStyles}>{correctedSentence}</p>
        </div>
    );
};


export default CorrectedSentence;
