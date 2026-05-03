import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import useFetchUserImage from "../../utils/custom_hooks/userData/useFetchUserImage";

const ChatMessage = ({
    messageContent,
    senderName,
    timestamp,
    type,
    isMyMessage,
    senderProfileImage,
    onDelete,
}) => {
    const { username, image, userId } = useSelector(
        (state) => state.api.userData
    );
    const { data, isLoading, error } = useFetchUserImage(userId, image);
    const myProfileImage = data?.photoUrl || null;
    const profileImage = isMyMessage ? myProfileImage : senderProfileImage;
    const msgtimestamp = new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    // State to track if image failed to load
    const [imageError, setImageError] = useState(false);
    // State to track dropdown visibility
    const [showDropdown, setShowDropdown] = useState(false);
    // Ref for the dropdown container
    const dropdownRef = useRef(null);

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    // Get first character of username for fallback
    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : "?";
    };

    // Generate a consistent color based on username
    const getAvatarColor = (name) => {
        if (!name) return "#6b7280";
        const colors = [
            "#ef4444",
            "#f97316",
            "#eab308",
            "#22c55e",
            "#06b6d4",
            "#3b82f6",
            "#8b5cf6",
            "#ec4899",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
        }
        setShowDropdown(false);
    };

    return (
        <section
            className={`ChatMessage w-full flex group ${
                isMyMessage ? "justify-end" : "justify-start"
            }`}
        >
            <div
                className={`w-fit p-2 rounded-lg flex gap-[10px] ${
                    isMyMessage ? "flex-row-reverse" : "flex-row"
                }`}
            >
                {/* =============== sender profile image =============== */}
                {profileImage && !imageError ? (
                    <img
                        className="min-w-[40px] min-h-[40px] w-[40px] h-[40px] rounded-full object-cover"
                        src={profileImage}
                        alt={`${senderName} profile image`}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div
                        className="min-w-[40px] min-h-[40px] w-[40px] h-[40px] rounded-full flex items-center justify-center text-white font-semibold text-lg fallback-avatar"
                        style={{ backgroundColor: getAvatarColor(senderName) }}
                    >
                        {getInitial(senderName)}
                    </div>
                )}

                {/* =============== message body =============== */}
                <div className="message-body relative">
                    {/* message header */}
                    <header
                        className={`${
                            isMyMessage ? "text-end" : "text-start"
                        } flex items-center gap-2 justify-between`}
                    >
                        <span
                            className={`senderName ${
                                isMyMessage
                                    ? "text-stone-700"
                                    : "text-green-600"
                            } font-medium text-sm`}
                        >
                            {senderName}
                        </span>

                        {/* Dots icon for message options */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="dots-icon"
                                >
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="19" cy="12" r="1.5" />
                                    <circle cx="5" cy="12" r="1.5" />
                                </svg>
                            </button>

                            {/* Dropdown menu */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                        </svg>
                                        Delete Message
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* message text */}
                    <div
                        className={`message-text p-[8px] rounded-[6px] text-white ${
                            isMyMessage ? "bg-blue-600" : "bg-gray-600"
                        }`}
                    >
                        {messageContent}
                    </div>

                    {/* message type */}
                    <footer
                        className={`message-type bg-transparent p-[0.2rem] text-black text-[10px] flex justify-between items-center gap-2`}
                    >
                        <span className="text-xs font-medium">
                            {type === "signToText"
                                ? "🤟 Sign-to-Text"
                                : type === "speechToText"
                                ? "🎤 Speech-to-Text"
                                : "💬 Regular-Text"}
                        </span>
                        <span className="timestamp text-xs text-gray-700">
                            {msgtimestamp}
                        </span>
                    </footer>
                </div>
            </div>
        </section>
    );
};

export default ChatMessage;
