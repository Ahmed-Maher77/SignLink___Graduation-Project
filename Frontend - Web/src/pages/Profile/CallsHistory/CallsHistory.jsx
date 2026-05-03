import React, { useState, useEffect } from "react";
import CallsHistoryHeader from "./components/CallsHistoryHeader";
import CallCard from "./components/CallCard";
import NoCalls from "./components/NoCalls";
import CallsHistoryLoading from "./components/CallsHistoryLoading";
import CallsHistoryError from "./components/CallsHistoryError";
import "./CallsHistory.scss";
import { useSelector } from "react-redux";
import useGetCallsHistory from "../../../utils/custom_hooks/api/callChat/useGetCallsHistory";

// const calls_history_dummy = [
//     {
//         callId: "abc123",
//         creatorName: "Ahmed Maher",
//         participants: [
//             {
//                 name: "Ahmed Maher",
//                 email: "ahmedmaher@gmail.com",
//                 joinTime: "2025-06-24T20:00:00Z",
//                 leavingTime: "2025-06-24T20:20:00Z",
//             },
//             {
//                 name: "Faysal",
//                 email: "faysal@gmail.com",
//                 joinTime: "2025-06-24T20:00:00Z",
//                 leavingTime: "2025-06-24T20:25:00Z",
//             },
//         ],
//         participantCount: 2,
//         startTime: "2025-06-24T20:00:00Z",
//         endTime: "2025-06-24T20:45:00Z",
//         duration: 2700, // seconds
//         status: "completed", // 2 options: "completed" | "ongoing"
//         chat: [
//             {
//                 message: "hello guys",
//                 type: "regularMsg", // 2 options: "regularMsg" | "signToText"
//                 senderName: "Ahmed Maher",
//                 timestamp: "2025-06-24T22:00:01Z",
//             },
//             {
//                 message: "I'm happy to meet you",
//                 type: "signToText",
//                 senderName: "Faysal",
//                 timestamp: "2025-06-24T22:00:21Z",
//             },
//         ],
//     },
//     {
//         callId: "def456",
//         creatorName: "Ahmed Maher",
//         participants: [
//             {
//                 name: "Ahmed Maher",
//                 email: "ahmedmaher@gmail.com",
//                 joinTime: "2025-06-25T14:30:00Z",
//                 leavingTime: "2025-06-25T15:45:00Z",
//             },
//             {
//                 name: "Sarah Johnson",
//                 email: "sarah.johnson@gmail.com",
//                 joinTime: "2025-06-25T14:35:00Z",
//                 leavingTime: "2025-06-25T15:40:00Z",
//             },
//         ],
//         participantCount: 2,
//         startTime: "2025-06-25T14:30:00Z",
//         endTime: "2025-06-25T15:50:00Z",
//         duration: 4800, // seconds
//         status: "completed",
//         chat: [
//             {
//                 message: "Good afternoon Sarah!",
//                 type: "regularMsg",
//                 senderName: "Ahmed Maher",
//                 timestamp: "2025-06-25T14:30:05Z",
//             },
//             {
//                 message: "Hello Ahmed, nice to see you",
//                 type: "signToText",
//                 senderName: "Sarah Johnson",
//                 timestamp: "2025-06-25T14:30:15Z",
//             },
//             {
//                 message: "Ready for our project discussion?",
//                 type: "regularMsg",
//                 senderName: "Ahmed Maher",
//                 timestamp: "2025-06-25T14:30:25Z",
//             },
//         ],
//     },
//     {
//         callId: "ghi789",
//         creatorName: "Ahmed Maher",
//         participants: [
//             {
//                 name: "Ahmed Maher",
//                 email: "ahmedmaher@gmail.com",
//                 joinTime: "2025-06-26T09:00:00Z",
//                 leavingTime: null,
//             },
//             {
//                 name: "David Wilson",
//                 email: "david.wilson@gmail.com",
//                 joinTime: "2025-06-26T09:05:00Z",
//                 leavingTime: null,
//             },
//         ],
//         participantCount: 2,
//         startTime: "2025-06-26T09:00:00Z",
//         endTime: null,
//         duration: 0, // ongoing call
//         status: "ongoing",
//         chat: [
//             {
//                 message: "Morning David!",
//                 type: "regularMsg",
//                 senderName: "Ahmed Maher",
//                 timestamp: "2025-06-26T09:05:10Z",
//             },
//             {
//                 message: "Good morning Ahmed, how are you?",
//                 type: "signToText",
//                 senderName: "David Wilson",
//                 timestamp: "2025-06-26T09:05:30Z",
//             },
//         ],
//     },
//     {
//         callId: "jkl012",
//         creatorName: "Maria Garcia",
//         participants: [
//             {
//                 name: "Maria Garcia",
//                 email: "maria.garcia@gmail.com",
//                 joinTime: "2025-06-23T16:00:00Z",
//                 leavingTime: "2025-06-23T16:30:00Z",
//             },
//             {
//                 name: "Ahmed Maher",
//                 email: "ahmedmaher@gmail.com",
//                 joinTime: "2025-06-23T16:02:00Z",
//                 leavingTime: "2025-06-23T16:28:00Z",
//             },
//         ],
//         participantCount: 2,
//         startTime: "2025-06-23T16:00:00Z",
//         endTime: "2025-06-23T16:35:00Z",
//         duration: 2100, // seconds
//         status: "completed",
//         chat: [
//             {
//                 message: "Welcome Ahmed to our weekly review",
//                 type: "regularMsg",
//                 senderName: "Maria Garcia",
//                 timestamp: "2025-06-23T16:00:10Z",
//             },
//             {
//                 message: "Thank you Maria, excited to share updates",
//                 type: "signToText",
//                 senderName: "Ahmed Maher",
//                 timestamp: "2025-06-23T16:00:25Z",
//             },
//             {
//                 message: "Let's start with your progress report",
//                 type: "regularMsg",
//                 senderName: "Maria Garcia",
//                 timestamp: "2025-06-23T16:00:35Z",
//             },
//         ],
//     },
//     {
//         callId: "mno345",
//         creatorName: "Alex Thompson",
//         participants: [
//             {
//                 name: "Alex Thompson",
//                 email: "alex.thompson@gmail.com",
//                 joinTime: "2025-06-22T11:00:00Z",
//                 leavingTime: "2025-06-22T11:45:00Z",
//             },
//             {
//                 name: "Ahmed Maher",
//                 email: "ahmedmaher@gmail.com",
//                 joinTime: "2025-06-22T11:00:00Z",
//                 leavingTime: "2025-06-22T11:45:00Z",
//             },
//         ],
//         participantCount: 2,
//         startTime: "2025-06-22T11:00:00Z",
//         endTime: "2025-06-22T11:45:00Z",
//         duration: 2700, // seconds
//         status: "completed",
//         chat: [
//             {
//                 message: "Hi Alex, ready for our brainstorming session?",
//                 type: "regularMsg",
//                 senderName: "Ahmed Maher",
//                 timestamp: "2025-06-22T11:00:05Z",
//             },
//             {
//                 message: "Absolutely! Let's get creative",
//                 type: "signToText",
//                 senderName: "Alex Thompson",
//                 timestamp: "2025-06-22T11:00:15Z",
//             },
//             {
//                 message: "I have some great ideas to share",
//                 type: "regularMsg",
//                 senderName: "Ahmed Maher",
//                 timestamp: "2025-06-22T11:00:30Z",
//             },
//             {
//                 message: "Perfect, I'm all ears",
//                 type: "signToText",
//                 senderName: "Alex Thompson",
//                 timestamp: "2025-06-22T11:00:45Z",
//             },
//         ],
//     },
//     {
//         callId: "pqr678",
//         creatorName: "Lisa Brown",
//         participants: [
//             {
//                 name: "Lisa Brown",
//                 email: "lisa.brown@gmail.com",
//                 joinTime: "2025-06-27T10:00:00Z",
//                 leavingTime: "2025-06-27T10:30:00Z",
//             },
//             {
//                 name: "Ahmed Maher",
//                 email: "ahmedmaher@gmail.com",
//                 joinTime: "2025-06-27T10:02:00Z",
//                 leavingTime: "2025-06-27T10:30:00Z",
//             },
//         ],
//         participantCount: 2,
//         startTime: "2025-06-27T10:00:00Z",
//         endTime: "2025-06-27T10:30:00Z",
//         duration: 1800, // seconds
//         status: "completed",
//         chat: [
//             {
//                 message: "Welcome Ahmed to our team meeting",
//                 type: "regularMsg",
//                 senderName: "Lisa Brown",
//                 timestamp: "2025-06-27T10:00:05Z",
//             },
//             {
//                 message: "Thank you Lisa, excited to meet everyone",
//                 type: "signToText",
//                 senderName: "Ahmed Maher",
//                 timestamp: "2025-06-27T10:00:20Z",
//             },
//             {
//                 message: "Let's start with introductions",
//                 type: "regularMsg",
//                 senderName: "Lisa Brown",
//                 timestamp: "2025-06-27T10:00:30Z",
//             },
//         ],
//     },
// ];

const CallsHistory = () => {
    const { email: myEmail } = useSelector((state) => state.api.userData);
    const {
        getCallsHistory,
        isPending: isCallsHistoryLoading,
        error,
        data: callsHistoryData,
    } = useGetCallsHistory();

    const [expandedCall, setExpandedCall] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");

    // Fetch calls history when component mounts
    useEffect(() => {
        if (myEmail) {
            getCallsHistory({ userEmail: myEmail });
        }
    }, [myEmail, getCallsHistory]);

    // Handle retry
    const handleRetry = () => {
        if (myEmail) {
            getCallsHistory({ userEmail: myEmail });
        }
    };

    // Get the actual calls data from API response
    const callsData = callsHistoryData?.data?.callsHistory || [];

    // Filter calls based on status
    const filteredCalls = callsData.filter((call) => {
        if (filterStatus === "all") return true;
        return call.status === filterStatus;
    });

    const toggleCallExpansion = (callId) => {
        setExpandedCall(expandedCall === callId ? null : callId);
    };

    return (
        <div className="calls-history">
            <CallsHistoryHeader
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
            />

            <div className="calls-list">
                {/* Loading state */}
                {isCallsHistoryLoading && <CallsHistoryLoading />}

                {/* Error state */}
                {error && !isCallsHistoryLoading && (
                    <CallsHistoryError error={error} onRetry={handleRetry} />
                )}

                {/* Success state */}
                {!isCallsHistoryLoading && !error && (
                    <>
                        {filteredCalls.length === 0 ? (
                            <NoCalls />
                        ) : (
                            filteredCalls.map((call) => (
                                <CallCard
                                    key={call.callId}
                                    call={call}
                                    expandedCall={expandedCall}
                                    toggleCallExpansion={toggleCallExpansion}
                                    myEmail={myEmail}
                                />
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CallsHistory;
