import React from "react";
import ParticipantsSection from "./ParticipantsSection";
import ChatSection from "./ChatSection";
import CallTimeline from "./CallTimeline";
import "./CallDetails.scss";

const CallDetails = ({ call }) => {
    return (
        <div className="call-details">
            <ParticipantsSection participants={call.participants} />
            <ChatSection chat={call.chat} />
            <CallTimeline call={call} />
        </div>
    );
};

export default CallDetails; 