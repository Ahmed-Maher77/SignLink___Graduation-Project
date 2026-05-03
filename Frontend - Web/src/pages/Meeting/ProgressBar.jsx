import React from "react";

const ProgressBar = ({ delayWidth, bufferWidth, styles }) => (
    <div style={styles.progressBarContainer}>
        <div style={{ ...styles.delayFill, width: `${delayWidth}%` }}></div>
        <div style={{ ...styles.progressFill, width: `${bufferWidth}%` }}></div>
        <div style={styles.dividerLine}></div>
        <div style={styles.delayLabel}>Delay</div>
        <div style={styles.frameBufferLabel}>Frame Buffer</div>
    </div>
);

export default ProgressBar;
