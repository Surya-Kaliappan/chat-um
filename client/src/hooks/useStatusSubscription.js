import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

export const useStatusSubscription = (userIds) => {
    const socket = useSocket();

    useEffect(() => {
        if(socket && userIds && userIds.length > 0){
            socket.emit("subscribeToStatus", userIds);

            return () => {
                socket.emit("unsubscribeFromStatus", userIds);
            };
        }
    }, [socket, userIds]);
};