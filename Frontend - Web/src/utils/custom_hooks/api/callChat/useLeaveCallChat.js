import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../axiosConfig"

const useLeaveCallChat = () => {
    const queryClient = useQueryClient();
    
    const { mutateAsync: leaveCallChat, isPending, error, data } = useMutation({
        mutationFn: (callIntitalData) => api.post("/Call/leaveCall", callIntitalData),
        
        onSuccess: (data) => {
            console.log("Call-Chat left successfully!", data);
        },
        
        onError: (error) => {
            console.error("Error leaving call-chat:", error.message);
        },
    });
    return { leaveCallChat, isPending, error, data };
};
export default useLeaveCallChat;
