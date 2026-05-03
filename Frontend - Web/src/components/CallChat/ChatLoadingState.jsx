import React from "react";

const ChatLoadingState = () => {
    return (
        <div className="flex justify-center items-center p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">
                    Getting chat messages...
                </span>
            </div>
        </div>
    );
};

export default ChatLoadingState; 