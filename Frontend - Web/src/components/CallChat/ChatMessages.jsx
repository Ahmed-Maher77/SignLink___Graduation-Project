import React from "react";
import MessageList from "./MessageList";
import EmptyChatState from "./EmptyChatState";
import { useMessageUtils } from "./useMessageUtils";

const ChatMessages = ({
    messages,
    senderProfileImage,
    onDeleteMessage,
    originalMessages,
}) => {
    const { isMyMessage } = useMessageUtils();

    return (
        <div className="ChatMessages flex flex-col gap-2 p-4 pb-10 overflow-y-auto h-full">
            {messages && messages.length > 0 ? (
                <MessageList
                    messages={messages}
                    senderProfileImage={senderProfileImage}
                    isMyMessage={isMyMessage}
                    onDeleteMessage={onDeleteMessage}
                    originalMessages={originalMessages}
                />
            ) : (
                <EmptyChatState />
            )}
        </div>
    );
};

export default ChatMessages;
