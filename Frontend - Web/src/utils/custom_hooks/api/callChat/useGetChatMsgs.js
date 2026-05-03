import { useMutation } from "@tanstack/react-query";
import api from "../axiosConfig"

const useGetChatMsgs = () => {
    const { mutateAsync: getChatMsgs, isPending, error, data } = useMutation({
        mutationFn: (callIntitalData) => api.post("/Call/getChatMsgs", callIntitalData),
        
        onSuccess: (data) => {
            console.log("Chat messages fetched successfully!", data);
        },
        
        onError: (error) => {
            console.error("Error fetching chat messages:", error.message);
        },
    });
    return { getChatMsgs, isPending, error, data };
};
export default useGetChatMsgs;
