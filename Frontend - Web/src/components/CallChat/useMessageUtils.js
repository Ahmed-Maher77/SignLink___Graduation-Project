import { useSelector } from "react-redux";

export const useMessageUtils = () => {
    const myUsername = useSelector((state) => state.api.userData.username);
    
    const isMyMessage = (message) => {
        return message.senderName.toLowerCase() === myUsername.toLowerCase();
    };
    
    return {
        isMyMessage,
        myUsername
    };
}; 