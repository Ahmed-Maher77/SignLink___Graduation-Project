import React from "react";
import ChatMessage from "./ChatMessage";

const MessageList = ({
    messages,
    senderProfileImage,
    isMyMessage,
    onDeleteMessage,
    originalMessages,
}) => {
    return (
        <>
            {messages.map((message, filteredIndex) => {
                // Find the original index of this message in the originalMessages array
                const originalIndex = originalMessages.findIndex(
                    (originalMsg) =>
                        originalMsg.id === message.id &&
                        originalMsg.timestamp === message.timestamp &&
                        originalMsg.message === message.message
                );

                return (
                    <div key={message.id || Math.random()} className="message">
                        <ChatMessage
                            messageContent={message.message}
                            senderName={message.senderName}
                            timestamp={message.timestamp}
                            type={message.type}
                            isMyMessage={isMyMessage(message)}
                            senderProfileImage={senderProfileImage}
                            onDelete={() => onDeleteMessage(originalIndex)}
                        />
                    </div>
                );
            })}
        </>
    );
};

export default MessageList;
