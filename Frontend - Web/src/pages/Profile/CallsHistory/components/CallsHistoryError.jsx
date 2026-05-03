import React from "react";
import "./CallsHistoryError.scss";

const CallsHistoryError = ({ error, onRetry }) => {
    return (
        <div className="calls-history-error">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Failed to load calls history</h3>
            <p className="error-message">
                {error?.message || error?.response?.data?.message || "An unexpected error occurred"}
            </p>
            {onRetry && (
                <button className="retry-button" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
};

export default CallsHistoryError; 