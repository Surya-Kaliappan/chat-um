import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES, HOST } from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MessageContainer = () => {
    const scrollRef = useRef();
    const {selectedChatType, selectedChatData, userInfo, selectedChatMessages, setSelectedChatMessages, setFileDownloadProgress, setIsDownloading, setSelectedChatType, setSelectedChatData} = useAppStore();
    const [showImage, setShowImage] = useState(false);
    const [imageURL, setImageURL] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pendingContact, setPendingContact] = useState(null);

    useEffect(() => {
        const getMessages = async () => {
            try{
                const response = await apiClient.post(GET_ALL_MESSAGES_ROUTE, {id: selectedChatData._id},{withCredentials: true});
                if(response.data.messages) {
                    setSelectedChatMessages(response.data.messages);
                }
            } catch (error) {
                console.log({error});
            }
        };
        const getChannelMessages = async () => {
            try{
                const response = await apiClient.get(`${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`, {withCredentials: true});
                if(response.data.messages){
                    setSelectedChatMessages(response.data.messages);
                }
            } catch (error) {
                console.log({error});
            } 
        }
        if(selectedChatData._id){
            if(selectedChatType === "contact") getMessages();
            else if(selectedChatType === "channel") getChannelMessages();
        }
    }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

    useEffect(() => {
        if(scrollRef.current) {
            scrollRef.current.scrollIntoView({behavious: "smooth"});
        }
    }, [selectedChatMessages]);

    const checkIfImage = (filePath) => {
        const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|ico|heic|heif)$/i;
        return imageRegex.test(filePath);
    };

    const renderMessages = () => {
        let lastDate = null;
        return selectedChatMessages.map((message, index) => {
            const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
            const showDate = messageDate !== lastDate;
            lastDate = messageDate;
            return (
                <div key={index}>
                    {showDate && (<div className="text-center text-gray-500 my-2 mb-1 sm:mb-10 mt-5 sm:mt-10">
                        {moment(message.timestamp).format("LL")}</div>
                    )}
                    {selectedChatType === "contact" && (renderDMMessages(message))}
                    {selectedChatType === "channel" && (renderChannelMessages(message))}
                </div>
            );
        });
    };

    const downloadFile = async (url) => {
        setIsDownloading(true);
        setFileDownloadProgress(0);
        const response = await apiClient.get(`${HOST}/${url}`,
            {
                responseType: "blob",
                onDownloadProgress: (ProgressEvent) => {
                    const {loaded, total} = ProgressEvent;
                    const percentageCompleted = Math.round((loaded*100)/total);
                    setFileDownloadProgress(percentageCompleted);
                }
            }
        );
        const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = urlBlob;
        link.setAttribute("download", url.split("/").pop());
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(urlBlob);
        setIsDownloading(false);
        setFileDownloadProgress(0);
    };

    const renderDMMessages = (message) => {
        return(
            <div className={`${message.sender === selectedChatData._id ? "text-left":"text-right"}`}>
                {message.messageType === "text" && (
                    <div className={`${message.sender !== selectedChatData._id ? "bg-[#0c6aeb]/30 text-white/90 border-[#0c6aeb]/80 text-left rounded-bl-md" : "bg-[#f59c0d]/30 text-white/80 border-[#f59c0d]/80 rounded-br-md"} text-sm sm:text-[16px] border inline-block px-3 py-2 rounded-tl-md rounded-tr-md my-1 mt-3 ml-3 sm:ml-6 max-w-[75%] sm:max-w-[45%] break-words whitespace-pre-line`}>
                        {message.content}
                    </div>
                )}
                {
                    message.messageType === "file" && (
                    <div className={`${message.sender !== selectedChatData._id ? "bg-[#0c6aeb]/30 text-[#0c6aeb]/90 border-[#0c6aeb]/50 text-left rounded-bl-md" : "bg-[#f59c0d]/30 text-white/80 border-[#f59c0d]/80 rounded-br-md"} border inline-block p-2 rounded-tl-md rounded-tr-md my-1 mt-3 ml-6 max-w-[80%] break-words`}>
                        {checkIfImage(message.fileUrl) ? 
                        (<div className="cursor-pointer" 
                        onClick={() => {
                            setShowImage(true);
                            setImageURL(message.fileUrl);
                        }}>
                            <img src={`${HOST}/${message.fileUrl}`} height={300} width={300} />
                        </div>) : (<div className="flex items-center justify-center gap-4">
                            <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                                <MdFolderZip />
                            </span>
                            <span>{message.fileUrl.split("/").pop()}</span>
                            <span 
                                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                                onClick={() => downloadFile(message.fileUrl)}
                            >
                                <IoMdArrowRoundDown />
                            </span>
                        </div>)}
                    </div>
                )}
                <div className="text-[10px] sm:text-[12px] pr-2 text-white/60 ml-5 sm:ml-8 mt-1">
                    {moment(message.timestamp).format("LT")}
                </div>
            </div>
        );
    };

    const handleConfirmSwitch = () => {
        if (!pendingContact) return;
        setSelectedChatType("contact");
        setSelectedChatData(pendingContact);
        if (selectedChatData && selectedChatData._id !== pendingContact._id) {
            setSelectedChatMessages([]);
        }
        setIsDialogOpen(false);
        setPendingContact(null);
    };

    const handleClick = (contact) => {
        setPendingContact(contact);
        setIsDialogOpen(true);
    };


    const renderChannelMessages = (message) => {
        return (
            <div className={`mt-5 ${message.sender._id !== userInfo.id ? "text-left" : "text-right"}`}>
                {message.sender._id !== userInfo.id && (<div className="flex items-center justify-start gap-3">
                    <Avatar className="h-8 w-8 rounded-full overflow-hidden">
                        {message.sender.image && (
                            <AvatarImage src={`${HOST}/${message.sender.image}`} alt="profile" className="object-cover w-full h-full bg-black" />
                        )} 
                        
                        <AvatarFallback className={`uppercase h-8 w-8 text-md flex items-center justify-center rounded-full ${getColor(message.sender.color)}`}>
                            {message.sender.firstName ? message.sender.firstName.split("").shift() : message.sender.email.split("").shift()}
                        </AvatarFallback>
                        
                    </Avatar>
                    <span className="text-sm text-white/60 cursor-pointer">{`${message.sender.firstName} ${message.sender.lastName}`}
                        &nbsp; <span className="text-[10px] sm:text-[12px] hover:text-white" onClick={()=> handleClick(message.sender)}>
                            <Tooltip>
                                <TooltipTrigger className="cursor-pointer">
                                    {`- { ${message.sender.email} }`}
                                </TooltipTrigger>
                                <TooltipContent className="border-none p-3 text-white">
                                    <p>Click to View DM</p>
                                </TooltipContent>
                            </Tooltip>
                            </span>
                    </span>

                    </div>
                )}
                {message.messageType === "text" && (
                        <div className={`${message.sender._id === userInfo.id 
                            ? "bg-[#0c6aeb]/30 text-white/90 border-[#0c6aeb]/80 text-left rounded-bl-md" 
                            : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20 rounded-br-md"} 
                            text-sm sm:text-[16px] border inline-block px-3 py-2 rounded-tl-md rounded-tr-md my-1 mt-2 ml-6 max-w-[80%] sm:max-w-[45%] break-words whitespace-pre-line`}>
                                {message.content}
                        </div>
                )}
                {message.messageType === "file" && (
                    <div className={`${message.sender._id === userInfo.id 
                        ? "bg-[#0c6aeb]/30 text-white/90 border-[#0c6aeb]/80 text-left rounded-bl-md" 
                        : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20 rounded-br-md"} 
                        border inline-block p-2 rounded-tl-md rounded-tr-md my-1 mt-2 ml-6 max-w-[80%] break-words`}
                    >
                        {checkIfImage(message.fileUrl) ? 
                        (<div className="cursor-pointer" 
                        onClick={() => {
                            setShowImage(true);
                            setImageURL(message.fileUrl);
                        }}>
                            <img src={`${HOST}/${message.fileUrl}`} width={250} />
                        </div>) : (<div className="flex items-center justify-center gap-4">
                            <span className="text-white/80 text-md sm:text-3xl bg-black/20 rounded-full p-3">
                                <MdFolderZip />
                            </span>
                            <span className="text-sm sm:text-[16px]">{message.fileUrl.split("/").pop()}</span>
                            <span 
                                className="bg-black/20 p-3 text-md sm:text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                                onClick={() => downloadFile(message.fileUrl)}
                            >
                                <IoMdArrowRoundDown />
                            </span>
                        </div>)}
                    </div>
                )}
                {<div className="text-[10px] sm:text-[12px] pr-2 text-white/60 ml-8 mt-1">{moment(message.timestamp).format("LT")}</div>}
            </div>
        );
    }


    return (
        <div className="flex-1 overflow-y-auto p-4 md:w-[65vw] lg:w-[70vw] xl:w-[75vw] w-full">
            {renderMessages()}
            <div ref={scrollRef} />
            {
                showImage && <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
                    <div>
                        <img src={`${HOST}/${imageURL}`} className="w-[80vw] sm:w-full lg:h-[80vh] xl:h-[80vh] bg-cover"/>
                    </div>
                    <div className="flex gap-5 fixed top-0 mt-5">
                        <button className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300" onClick={() => {downloadFile(imageURL);}}>
                            <IoMdArrowRoundDown />
                        </button>
                        <button className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300" onClick={() => {setShowImage(false); setImageURL(null);}}>
                            <IoCloseSharp />
                        </button>
                    </div>
                </div>
            }
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent className="bg-[#181920] border-none text-white poppins-medium">
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to switch chats?</AlertDialogTitle>
                    <AlertDialogDescription>
                    
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="text-black bg-white hover:bg-white/70 cursor-pointer" onClick={() => setPendingContact(null)}>
                    Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction className="hover:bg-[#0c6aeb]/80 bg-[#2a2b33] font-bold cursor-pointer" onClick={handleConfirmSwitch}>
                    switch
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MessageContainer;