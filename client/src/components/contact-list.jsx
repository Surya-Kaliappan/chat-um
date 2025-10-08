import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "./ui/avatar";
import { getColor } from "@/lib/utils";
import { GET_CHANNEL, HOST } from "@/utils/constants";
import { apiClient } from "@/lib/api-client";

const ContactList = ({contacts, isChannel = false}) => {

    const {selectedChatData, setSelectedChatData, setSelectedChatType, setSelectedChatMessages} = useAppStore();

    const handleClick = (contact) => {
        if(isChannel) setSelectedChatType("channel");
        else setSelectedChatType("contact");
        setSelectedChatData(contact);
        if(selectedChatData && selectedChatData._id !== contact._id){
            setSelectedChatMessages([]);
        }
    };

    return (
        <div className="mt-5">
            {contacts.map((contact) => (
                <div 
                key={contact._id} 
                className={`pl-7 py-3 transition-all text-sm sm:text-md duration-300 hover:bg-white/10 rounded-md cursor-pointer ${selectedChatData && selectedChatData._id === contact._id ? "bg-[#0c6aeb]/30 border-1 border-[#0c6aeb]/80 hover:bg-[#0c6aeb]/50":"hover-bg[#8417ff]"}`}
                onClick={() => handleClick(contact)}
                >
                    <div className="flex gap-4 items-center justify-start text-neutral-300">
                        {
                            !isChannel && (<Avatar className="h-10 w-10 rounded-full overflow-hidden bg-[#1b1c24]">
                                {contact.image ? (
                                    <AvatarImage src={`${HOST}/${contact.image}`} alt="profile" className="object-cover w-full h-full bg-black" />
                                ) : (
                                    <div className={`${getColor(contact.color)} uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}>
                                        {contact.firstName ? contact.firstName.split("").shift() : contact.email.split("").shift()}
                                    </div>
                                )}
                            </Avatar>
                        )}
                        {isChannel && <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">#</div>}
                        <div className="text-sm sm:text-[16px]">
                        {
                            isChannel 
                            ? <div className="font-bold">{contact.name}</div> 
                            : <div className="font-bold">
                                {contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.email}
                            </div>
                        }
                        <div className="text-white/50 text-[10px] sm:text-[12px] mt-1">
                            {isChannel ? `Admin - ${contact.admin[0].email}`:`${contact.email}`}
                        </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ContactList;