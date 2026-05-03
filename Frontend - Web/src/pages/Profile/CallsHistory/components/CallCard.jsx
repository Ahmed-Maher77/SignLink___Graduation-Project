import React from "react";
import CallHeader from "./CallHeader";
import CallDetails from "./CallDetails";
import "./CallCard.scss";

const CallCard = ({ call, expandedCall, toggleCallExpansion, myEmail }) => {
    return (
        <div className="call-card">
            <CallHeader 
                call={call} 
                isExpanded={expandedCall === call.callId}
                onToggle={() => toggleCallExpansion(call.callId)}
                myEmail={myEmail}
            />
            
            {expandedCall === call.callId && (
                <CallDetails call={call} />
            )}
        </div>
    );
};

export default CallCard; 