import React from "react";
import { formatDuration, formatDate } from "../utils/dateUtils";
import "./CallHeader.scss";

const CallHeader = ({ call, isExpanded, onToggle, myEmail }) => {
    // Find the other participant (not the current user)
    const otherParticipant = call.participants.find(
        (participant) => participant.email !== myEmail
    );

    // Get the display name for the call
    const getCallDisplayName = () => {
        if (!otherParticipant) {
            // If no other participant found, fallback to creator name
            return call.creatorName;
        }
        return otherParticipant.name;
    };

    return (
        <div className="call-header" onClick={onToggle}>
            <div className="call-info">
                <div className="call-title">
                    <h3>Call with {getCallDisplayName()}</h3>
                    <span className={`status-badge ${call.status}`}>
                        {call.status === "ongoing" ? "🟢 Live" : "✅ Completed"}
                    </span>
                </div>
                <div className="call-meta">
                    <span className="participants">
                        👥 {call.participantCount} participants
                    </span>
                    <span className="duration">
                        ⏱️ {formatDuration(call.duration)}
                    </span>
                    <span className="date">
                        📅 {formatDate(call.startTime)}
                    </span>
                </div>
            </div>
            <div className="call-actions">
                <button className="expand-btn">
                    <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
                </button>
            </div>
        </div>
    );
};

export default CallHeader;
