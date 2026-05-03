import { useEffect, useState } from "react";
import useGetChatMsgs from "../../utils/custom_hooks/api/callChat/useGetChatMsgs";

export const useChatPolling = (callData) => {
    const {
        getChatMsgs,
        isPending: isGettingChatMsgs,
        error: getChatMsgsError,
        data: chatMsgsData,
    } = useGetChatMsgs();

    const [pollingInterval, setPollingInterval] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [stableChatData, setStableChatData] = useState(null);

    // Function to fetch chat messages
    const fetchChatMessages = async () => {
        if (callData && callData.data?.callId) {
            try {
                await getChatMsgs({ callId: callData.data.callId });
            } catch (error) {
                console.error("Error fetching chat messages:", error);
            }
        }
    };

    // Start polling for chat messages when call is active
    useEffect(() => {
        if (callData && callData.data?.callId) {
            console.log(
                "Starting chat message polling for call:",
                callData.data.callId
            );

            // Initial fetch
            fetchChatMessages();

            // Set up polling every 2 seconds
            const interval = setInterval(() => {
                fetchChatMessages();
            }, 2000);

            setPollingInterval(interval);

            // Cleanup on unmount or when callData changes
            return () => {
                if (interval) {
                    clearInterval(interval);
                    setPollingInterval(null);
                }
            };
        }
    }, [callData]);

    // Update stable data when new data is received
    useEffect(() => {
        if (chatMsgsData && chatMsgsData.data) {
            console.log("Received chat messages:", chatMsgsData.data);
            
            // Update stable data with new data
            setStableChatData(chatMsgsData);
            
            // Mark that we've loaded at least once
            if (!hasLoadedOnce) {
                setHasLoadedOnce(true);
                setIsInitialLoad(false);
            }
        }
    }, [chatMsgsData, hasLoadedOnce]);

    // Determine if we should show loading state
    const shouldShowLoading = isGettingChatMsgs && isInitialLoad && !stableChatData?.data?.messages?.length;

    return {
        chatMsgsData: stableChatData, // Use stable data instead of mutation data
        isGettingChatMsgs: shouldShowLoading, // Only show loading on initial load when no messages exist
        getChatMsgsError,
        fetchChatMessages,
    };
}; 