import { useEffect } from "react";

export const useCallDataLogger = (callData, endCallData, leaveCallData) => {
    // Log call data changes
    useEffect(() => {
        if (callData) {
            console.log("Call data:", callData.data);
            if (callData.data?.startTime) {
                const formattedTime = formatTime(callData.data.startTime);
                console.log("Formatted start time:", formattedTime);
            }
        }
    }, [callData]);

    // Log end call data
    useEffect(() => {
        if (endCallData) {
            console.log("End call data:", endCallData.data);
        }
    }, [endCallData]);

    // Log leave call data
    useEffect(() => {
        if (leaveCallData) {
            console.log("Leave call data:", leaveCallData.data);
        }
    }, [leaveCallData]);

    // format the time to [H:M:S] am or pm
    function formatTime(isoString) {
        const date = new Date(isoString);
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${hours}:${minutes}:${seconds} ${ampm}`;
    }

    return { formatTime };
};
