import React from "react";
import "./CallsHistoryLoading.scss";

const CallsHistoryLoading = () => {
    return (
        <div className="calls-history-loading">
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
            <p className="loading-text">Fetching calls history...</p>
        </div>
    );
};

export default CallsHistoryLoading; 