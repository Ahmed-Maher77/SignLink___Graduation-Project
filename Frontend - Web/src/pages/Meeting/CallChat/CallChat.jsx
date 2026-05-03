import React from "react";
import ChatContainer from "../../../components/CallChat/ChatContainer";
import "./CallChat.scss";

const CallChat = ({
    senderProfileImage,
    isVisible,
    onClose,
    isConnected,
    callData,
    isLoading,
    endCallData,
    leaveCallData,
    onSendMessage,
    isSendingMessage,
}) => {
    return (
        <ChatContainer
            senderProfileImage={senderProfileImage}
            isVisible={isVisible}
            onClose={onClose}
            isConnected={isConnected}
            callData={callData}
            isLoading={isLoading}
            endCallData={endCallData}
            leaveCallData={leaveCallData}
            onSendMessage={onSendMessage}
            isSendingMessage={isSendingMessage}
        />
    );
};

export default CallChat;
