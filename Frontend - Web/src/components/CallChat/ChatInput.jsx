import React, { useState } from "react";

const ChatInput = ({ onSendMessage, isSending = false }) => {
    const [inputValue, setInputValue] = useState("");

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSendMessage = () => {
        if (inputValue.trim() !== "") {
            onSendMessage(inputValue);
            setInputValue("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const isSendButtonDisabled = inputValue.trim() === "" || isSending;

    return (
        <form
            className="chat-input-container p-4 border-t border-gray-200"
            onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
            }}
        >
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isSendButtonDisabled}
                    className={`send-button p-2 rounded-lg transition-all duration-200 ${
                        isSendButtonDisabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                    }`}
                    title={
                        isSendButtonDisabled
                            ? isSending
                                ? "Sending..."
                                : "Type a message to send"
                            : "Send message"
                    }
                >
                    {isSending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                        <i className="fas fa-paper-plane text-sm"></i>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ChatInput;
