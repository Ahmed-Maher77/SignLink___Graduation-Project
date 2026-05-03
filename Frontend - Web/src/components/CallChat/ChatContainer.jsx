import React, { useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMainContent from "./ChatMainContent";
import { useChatPolling } from "./useChatPolling";
import { useCallDataLogger } from "./useCallDataLogger";

// const chats_dummy_data = [
//     {
//         id: 1,
//         message: "Hello, how are you?",
//         type: "regularMsg",
//         senderName: "Ahmed Maher",
//         timestamp: "2024-06-24T14:01:00Z",
//     },
//     {
//         id: 2,
//         message: "I'm good, and you?",
//         type: "regularMsg",
//         senderName: "Faysal",
//         timestamp: "2024-06-24T14:01:10Z",
//     },
//     {
//         id: 3,
//         message: "I'm good, thank you",
//         type: "regularMsg",
//         senderName: "Ahmed Maher",
//         timestamp: "2024-06-24T14:01:25Z",
//     },
//     {
//         id: 4,
//         message: "Do you like apples?",
//         type: "regularMsg",
//         senderName: "Faysal",
//         timestamp: "2024-06-24T14:01:35Z",
//     },
//     {
//         id: 5,
//         message: "Yes I like apples",
//         type: "signToText",
//         senderName: "Faysal",
//         timestamp: "2024-06-24T14:01:50Z",
//     },
//     {
//         id: 6,
//         message: "Cool",
//         type: "regularMsg",
//         senderName: "Ahmed Maher",
//         timestamp: "2024-06-24T14:02:00Z",
//     },
// ];

const ChatContainer = ({
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
    // State to track ignored message indices
    const [ignoredMessages, setIgnoredMessages] = useState([]);

    // Custom hooks for: Chat Polling, Call Data Logger
    const { chatMsgsData, isGettingChatMsgs, getChatMsgsError } =
        useChatPolling(callData);
    useCallDataLogger(callData, endCallData, leaveCallData);

    // Function to handle message deletion (frontend only)
    const handleDeleteMessage = (messageIndex) => {
        setIgnoredMessages((prev) => [...prev, messageIndex]);
        console.log(`Message at index ${messageIndex} marked for deletion`);
    };

    // Filter out ignored messages
    const filteredMessages =
        chatMsgsData?.data?.messages?.filter(
            (_, index) => !ignoredMessages.includes(index)
        ) || [];

    const handleSendMessage = async (message) => {
        if (onSendMessage) {
            try {
                await onSendMessage(message);
                console.log("Message sent successfully:", message);
            } catch (error) {
                console.error("Error sending message:", error);
            }
        } else {
            console.warn("No onSendMessage function provided");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div
            className={`call-chat-sidebar ${isVisible ? "visible" : "hidden"}`}
        >
            <main className="CallChat w-[300px] lg:w-[350px] h-full bg-white shadow-lg fixed right-0 top-0 flex flex-col gap-2 z-50">
                <ChatHeader isConnected={isConnected} onClose={onClose} />

                <ChatMainContent
                    chatMsgsData={{
                        ...chatMsgsData,
                        data: {
                            ...chatMsgsData?.data,
                            messages: filteredMessages,
                        },
                    }}
                    isGettingChatMsgs={isGettingChatMsgs}
                    getChatMsgsError={getChatMsgsError}
                    senderProfileImage={senderProfileImage}
                    onDeleteMessage={handleDeleteMessage}
                    originalMessages={chatMsgsData?.data?.messages || []}
                />

                <ChatInput
                    onSendMessage={handleSendMessage}
                    isSending={isSendingMessage}
                />
            </main>
        </div>
    );
};

export default ChatContainer;
