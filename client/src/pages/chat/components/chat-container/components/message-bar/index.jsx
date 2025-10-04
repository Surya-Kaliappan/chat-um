import { useSocket } from "@/context/SocketContext";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";

const MessageBar = () => {
    const emojiRef = useRef();
    const fileInputRef = useRef();
    const {selectedChatType, selectedChatData, userInfo, setIsUploading, setFileUploadProgress} = useAppStore();
    const socket = useSocket();
    const [message, setMessage] = useState("");
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; 
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [message]);

    useEffect(() => {
        function handleClickOutside(event) {
            if(emojiRef.current && !emojiRef.current.contains(event.target)) {
                setEmojiPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [emojiRef]);

    const handleAddEmoji = (emoji) => {
        setMessage((msg) => msg + emoji.emoji);
    }

    const handleSendMessage = async () => {
        if(selectedChatType === "contact") {
            socket.emit("sendMessage", {
                sender: userInfo.id,
                content: message.trim(),
                recipient: selectedChatData._id,
                messageType: "text",
                fileUrl: undefined,
            });
        } else if(selectedChatType === "channel") {
            socket.emit("send-channel-message", {
                sender: userInfo.id,
                content: message.trim(),
                channelId: selectedChatData._id,
                messageType: "text",
                fileUrl: undefined,
            });
        }
        setMessage("");
    }

    const handleAttachmentClick = () => {
        if(fileInputRef.current){
            fileInputRef.current.click();
        }
    }

    const handleAttachmentChange = async (event) => {
        try{
            const file = event.target.files[0];
            if(file) {
                const formData = new FormData();
                formData.append("file", file);
                setIsUploading(true);
                const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, 
                    {
                        withCredentials: true,
                        onUploadProgress: (data) => {
                            setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
                        }
                    });

                if(response.status===200 && response.data) {
                    setIsUploading(false);
                    if(selectedChatType === "contact") {
                        socket.emit("sendMessage", {
                            sender: userInfo.id,
                            content: undefined,
                            recipient: selectedChatData._id,
                            messageType: "file",
                            fileUrl: response.data.filePath,
                        });
                    } else if(selectedChatType === "channel") {
                        socket.emit("send-channel-message", {
                        sender: userInfo.id,
                        content: undefined,
                        channelId: selectedChatData._id,
                        messageType: "file",
                        fileUrl: response.data.filePath,
                    });
                    }
                }
            }
        } catch (error) {
            setIsUploading(false);
            console.log({error});
        }
    }

    return (
        <div className="min-h-[8vh] sm:min-h-[10vh] bg-[#1c1d25] flex justify-end items-end px-3 sm:px-8 md:px-5 mb-15 sm:mb-6 md:mb-4 gap-2 sm:gap-6">
            <div className="flex-1 flex bg-[#2a2b33] rounded-md rounded-tr-4xl rounded-br-4xl items-end gap-0 sm:gap-5 px-2 sm:px-5">
                <div className="relative">
                    <button 
                        className="text-neutral-500 pb-3 sm:pb-5 focus:border-none focus:outline-none focus:text-white duration-300 transition-all cursor-pointer"
                        onClick={() => setEmojiPickerOpen(true)}
                    >
                        <RiEmojiStickerLine className="text-2xl"/>
                    </button>
                    <div className="absolute bottom-16 sm:bottom-20 left-0" ref={emojiRef}>
                        <EmojiPicker 
                            theme="dark"
                            open={emojiPickerOpen}
                            onEmojiClick={handleAddEmoji}
                            autoFocusSearch={false}
                            width="320px"
                        />
                    </div>
                </div>
                <textarea 
                    ref={textareaRef}
                    className="flex-1 w-full p-3 sm:p-5 rounded-md focus:border-none focus:outline-none resize-none max-h-40" 
                    placeholder="Enter Message" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="1"
                />
                <button 
                className="text-neutral-500 pb-3 sm:pb-5 focus:border-none focus:outline-none focus:text-white duration-300 transition-all cursor-pointer" 
                onClick={handleAttachmentClick}>
                    <GrAttachment className="text-2xl"/>
                </button>
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleAttachmentChange} />
            </div>
            <button 
                className="bg-[#f59c0d]/70 rounded-md flex items-center justify-center p-3 sm:p-5 focus:border-none hover:bg-[#0c6aeb] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all cursor-pointer"
                onClick={handleSendMessage}
                disabled={!message.trim()}
            >
                <IoSend className="text-2xl"/>
            </button>
        </div>
        
    );
};

export default MessageBar;