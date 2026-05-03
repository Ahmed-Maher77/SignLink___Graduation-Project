import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../axiosConfig";

const useSendChatMsg = () => {
    const queryClient = useQueryClient();

    const {
        mutateAsync: sendChatMsg,
        isPending,
        error,
        data,
    } = useMutation({
        mutationFn: (messageData) => api.post("Call/sendMsg", messageData),

        onSuccess: (data) => {
            console.log("Chat message sent successfully!", data);
        },

        onError: (error) => {
            console.error("Error sending chat message:", error.message);
        },
    });
    return { sendChatMsg, isPending, error, data };
};
export default useSendChatMsg;
