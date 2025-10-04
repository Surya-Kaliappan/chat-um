import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "./ui/avatar";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";

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
                className={`pl-7 py-2 transition-all text-sm sm:text-md duration-300 cursor-pointer ${selectedChatData && selectedChatData._id === contact._id ? "bg-[#0c6aeb]/30 border-1 border-[#0c6aeb]/80 hover:bg-[#0c6aeb]/50":"hover-bg[#8417ff]"}`}
                onClick={() => handleClick(contact)}
                >
                    <div className="flex gap-4 items-center justify-start text-neutral-300">
                        {
                            !isChannel && (<Avatar className="h-10 w-10 rounded-full overflow-hidden">
                                {contact.image ? (
                                    <AvatarImage src={`${HOST}/${contact.image}`} alt="profile" className="object-cover w-full h-full bg-black" />
                                ) : (
                                    <div className={`${selectedChatData && selectedChatData._id === contact._id ? "bg-[#f58e0d] border border-white/70" : getColor(contact.color)} uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}>
                                        {contact.firstName ? contact.firstName.split("").shift() : contact.email.split("").shift()}
                                    </div>
                                )}
                            </Avatar>
                        )}
                        {isChannel && <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">#</div>}
                        {
                            isChannel ? <span>{contact.name}</span> : <span>{contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.email}</span>
                        }
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ContactList;