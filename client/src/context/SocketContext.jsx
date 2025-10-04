import { useAppStore } from '@/store';
import { HOST } from '@/utils/constants';
import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { NotificationToast } from '@/components/NotificationToast';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({children}) => {
    const socket = useRef();
    const {userInfo, updateUserStatus} = useAppStore();

    useEffect(() => {
        if(userInfo){
            socket.current = io(HOST, {
                withCredentials: true,
                query: {userId: userInfo.id},
            });
            socket.current.on("connect", () => {
                console.log("Connected to socket server");
            });

            const handleRecieveMessage = (message) => {
                const {selectedChatData, selectedChatType, addMessage, addContactsInDMContacts} = useAppStore.getState();

                if(selectedChatType!==undefined && (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id)){
                    addMessage(message);
                }
                addContactsInDMContacts(message);
                const imageUrl = message.sender.image ? `${HOST}/${message.sender.image}` : false;
                if(userInfo.id === message.recipient._id){
                    if(selectedChatData){
                        if(selectedChatData._id === message.sender._id) return;
                    }
                    toast(<NotificationToast
                        imageUrl={imageUrl}
                        name={message.sender.firstName ? `${message.sender.firstName}` : `${message.sender.email}`}
                        message={message.messageType === "text" ? message.content : "Sent a file"}
                        color={message.sender.color}
                    />)
                }
            };

            const handleRecieveChannelMessage = (message) => {
                const {selectedChatData, selectedChatType, addMessage, addChannelInChannelList} = useAppStore.getState();

                if(selectedChatType!==undefined && selectedChatData._id === message.channelId){
                    addMessage(message);
                }
                addChannelInChannelList(message);
            };

            const handleStatusUpdate = ({userId, isOnline}) => {
                updateUserStatus(userId, isOnline);
            }

            socket.current.on("recieveMessage", handleRecieveMessage);
            socket.current.on("recieve-channel-message", handleRecieveChannelMessage);
            socket.current.on("statusUpdate", handleStatusUpdate);

            return () => {
                socket.current.disconnect();
            };
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    );
}