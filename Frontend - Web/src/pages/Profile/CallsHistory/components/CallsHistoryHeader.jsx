import React from "react";
import "./CallsHistoryHeader.scss";

const CallsHistoryHeader = ({ filterStatus, setFilterStatus }) => {
    return (
        <div className="calls-history-header">
            <h2>Calls History</h2>
            <div className="filter-controls">
                <button
                    className={`filter-btn ${
                        filterStatus === "all" ? "active" : ""
                    }`}
                    onClick={() => setFilterStatus("all")}
                >
                    All Calls
                </button>
                <button
                    className={`filter-btn ${
                        filterStatus === "completed" ? "active" : ""
                    }`}
                    onClick={() => setFilterStatus("completed")}
                >
                    Completed
                </button>
                <button
                    className={`filter-btn ${
                        filterStatus === "ongoing" ? "active" : ""
                    }`}
                    onClick={() => setFilterStatus("ongoing")}
                >
                    Ongoing
                </button>
            </div>
        </div>
    );
};

export default CallsHistoryHeader;
