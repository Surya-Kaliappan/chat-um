import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import Lottie from "react-lottie";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { HOST, SEARCH_CONTACT_ROUTES } from "@/utils/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { useDebounce } from "@/hooks/useDebounce";

const NewDM = () => {
    const {setSelectedChatType, setSelectedChatData} = useAppStore();
    const [openNewContactModal, setOpenNewContactModal] = useState(false);
    const [searchName, setSearchName] = useState("");
    const [searchedContacts, setSearchedContacts] = useState([]);
    const [searching, setSearching] = useState(false);

    const deBouncedTerm = useDebounce(searchName, 500);

    useEffect(() => {
        const searchContacts = async (searchTerm) => {
            try{
                if(searchTerm.length>0){
                    setSearching(true);
                    const response = await apiClient.post(SEARCH_CONTACT_ROUTES, {searchTerm}, {withCredentials: true});
                    setSearching(false);
                    if(response.status === 200 && response.data.contacts) {
                        setSearchedContacts(response.data.contacts);
                    }
                } else {
                    setSearchedContacts([]);
                }
            } catch (error) {
                console.log({error});
            }
        };
        searchContacts(searchName.trim());
    }, [deBouncedTerm]);

    

    const selectNewContact = (contact) => {
        setOpenNewContactModal(false);
        setSelectedChatType("contact");
        setSelectedChatData(contact);
        setSearchedContacts([]);
        setSearchName("");
    };

    return (
        <>
            <Tooltip>
                <TooltipTrigger>
                    <FaSearch className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" 
                        onClick={() => setOpenNewContactModal(true)}
                    />
                </TooltipTrigger>
                <TooltipContent
                    className="border-none p-3 text-white"
                >
                    <p>Select Contact</p>
                </TooltipContent>
            </Tooltip>
            <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
                <DialogContent className="bg-[#181920] border-none text-white w-[400px] sm:w-[600px] h-auto min-h-[450px] sm:min-h-[500px] flex flex-col poppins-medium">
                    <DialogHeader>
                        <DialogTitle>{searching ? 'Searching' : 'Search Contact'}</DialogTitle>
                    <DialogDescription>Direct Message</DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder="Search Contacts"
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                    { searchedContacts.length > 0 && (
                        <ScrollArea className="h-[250px] mt-2 sm:mt-5">
                            <div className="flex flex-col gap-2 sm:gap-0">
                                {searchedContacts.map((contact) => (
                                    <div key={contact._id} className="flex gap-3 sm:gap-5 items-center cursor-pointer p-2 hover:bg-white/20 rounded-sm" onClick={() => selectNewContact(contact)}>
                                        <div className="h-10 sm:h-12 w-10 sm:w-12 relative">
                                            <Avatar className="h-10 sm:h-12 w-10 sm:w-12 rounded-full overflow-hidden bg-[#1c1d25]">
                                                {contact.image ? (
                                                    <AvatarImage src={`${HOST}/${contact.image}`} alt="profile" className="object-cover w-full h-full bg-black rounded-full" />
                                                ) : (
                                                    <div className={`uppercase h-10 sm:h-12 w-10 sm:w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(contact.color)}`}>
                                                        {contact.firstName ? contact.firstName.split("").shift() : contact.email.split("").shift()}
                                                    </div>
                                                )}
                                            </Avatar>
                                        </div>
                                        <div className="flex flex-col text-sm sm:text-[16px]">
                                            <span>
                                                {contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : contact.email}
                                            </span>
                                            <span className="text-xs mt-0 sm:mt-1 text-white/50">{contact.email}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                    {
                        searchedContacts.length<=0 && (
                            <div className="flex-1 md:flex flex-col mt-10 md:mt-0 justify-center items-center duration-1000 transition-all">
                                <Lottie
                                    isClickToPauseDisabled={true}
                                    height={150}
                                    width={150}
                                    options={animationDefaultOptions}
                                />
                                <div className="text-capcity-80 text-white flex flex-col gap-5 items-center mt-0 lg:text-3xl text-2xl transition-all duration-300 text-center">
                                    <h3 className="poppins-medium">
                                        <span className="text-[#0c6aeb] font-semibold">Chat</span>
                                        <span className="text-[#f59c0d] font-semibold"> UM</span>
                                    </h3>
                                </div>
                            </div>
                        )
                    }
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NewDM;