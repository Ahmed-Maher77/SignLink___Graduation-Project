import React from "react";

const ChatHeader = ({ isConnected, onClose }) => {
    return (
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-800">
                    Call Chat
                </h3>
                {!isConnected && (
                    <i className="fas fa-wifi-slash text-red-500 text-sm"></i>
                )}
            </div>
            <button
                className="close-icon text-2xl text-red-500 hover:text-red-700 transition-colors duration-200"
                title="Close Chat"
                onClick={onClose}
            >
                &#10005;
            </button>
        </header>
    );
};

export default ChatHeader; 