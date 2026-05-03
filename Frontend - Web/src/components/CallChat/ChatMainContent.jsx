import React from "react";
import ChatMessages from "./ChatMessages";
import ChatLoadingState from "./ChatLoadingState";
import ChatErrorState from "./ChatErrorState";

const ChatMainContent = ({
    chatMsgsData,
    isGettingChatMsgs,
    getChatMsgsError,
    senderProfileImage,
    onDeleteMessage,
    originalMessages,
}) => {
    const hasMessages =
        chatMsgsData?.data?.messages && chatMsgsData.data.messages.length > 0;
    const showLoading = isGettingChatMsgs && !hasMessages; // Only show loading if no messages exist

    return (
        <>
            {/* Loading state - only show if no messages exist */}
            {showLoading && <ChatLoadingState />}

            {/* Error state */}
            {getChatMsgsError && <ChatErrorState error={getChatMsgsError} />}

            {/* Messages - always show if we have data, even during polling */}
            <ChatMessages
                messages={chatMsgsData?.data?.messages || []}
                senderProfileImage={senderProfileImage}
                onDeleteMessage={onDeleteMessage}
                originalMessages={originalMessages}
            />
        </>
    );
};

export default ChatMainContent;
