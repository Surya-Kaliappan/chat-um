import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, EDIT_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTES, GET_CHANNEL, HOST, SEARCH_CHANNEL_ROUTES } from "@/utils/constants";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import Lottie from "react-lottie";
import { animationDefaultOptions } from "@/lib/utils";

const CreateChannel = () => {
    const {addChannels, setSelectedChatType, setSelectedChatData, userInfo} = useAppStore();
    const [newChannelModal, setNewChannelModal] = useState(false);
    const [searchChannelModal, setSearchChannelModal] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName, setChannelName] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchName, setSearchName] = useState("");
    const [searchedChannels, setSearchedChannels] = useState([]);

    const deBouncedTerm = useDebounce(searchName, 300);

    useEffect(() => {
        const searchChannel = async (searchTerm) => {
            try{
                if(searchTerm.length>0){
                    setSearching(true);
                    const response = await apiClient.post(SEARCH_CHANNEL_ROUTES, {searchTerm}, {withCredentials: true});
                    if(response.status === 200 && response.data.channels){
                        setSearchedChannels(response.data.channels);
                    }
                    setSearching(false);
                } else {
                    setSearchedChannels([]);
                }
            } catch (error) {
                toast("Something went Wrong");
                console.log({error});
            }
        }
        searchChannel(searchName.trim());
    }, [deBouncedTerm]);

    useEffect(() => {
        const getData = async () => {
            const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
                withCredentials: true,
            });
            setAllContacts(response.data.contacts);
        };
        getData();
    }, []);

    const createChannel = async () => {
        try{
            if(channelName.length > 0 && selectedContacts.length > 0){
                const response = await apiClient.post(
                    CREATE_CHANNEL_ROUTE, 
                    {
                        name: channelName,
                        members: selectedContacts.map((contact) => contact.value),
                    },
                    {withCredentials: true},
                );
                if(response.status===201){
                    setChannelName("");
                    setSelectedContacts([]);
                    setNewChannelModal(false);
                    addChannels(response.data.channel);
                }
            } else {
                toast("Please Fill the Required Details")
            }
        } catch (error) {
            console.log({error});
            if(error.status===409){
                toast.error("Channel Already created..");
            } else if(error.status === 500){
                toast.error("Server Error");
            } else {
                toast.error(error.code);
            }
        }
    }

    const selectChannel = async (channel) => {
        setSearchChannelModal(false);
        try{
            if(channel._id){
                const response = await apiClient.get(`${GET_CHANNEL}/${channel._id}`, {withCredentials: true});
                if(response.data.channel){
                    const members = response.data.channel.members;
                    if(!members.includes(userInfo.id)){
                        members.push(userInfo.id);
                        await apiClient.post(EDIT_CHANNEL_ROUTE, {
                            channelId: channel._id,
                            name: channel.name,
                            members: members,
                        }, {withCredentials: true});
                    }
                    setSelectedChatData(response.data.channel);
                    setSelectedChatType("channel");
                }
            }
        } catch (error) {
            console.log({error});
            toast("Something Went Wrong");
        } finally {
            setSearchedChannels([]);
            setSearchName("");
        }
    }

    return (
        <>
            <div className="flex flex-rows gap-6 sm:gap-8">
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" 
                            onClick={() => setNewChannelModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent
                        className="border-none p-3 text-white"
                    >
                        Create New Channel
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>
                        <FaSearch className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" 
                            onClick={() => setSearchChannelModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent
                        className="border-none p-3 text-white"
                    >
                        Search Channel
                    </TooltipContent>
                </Tooltip>
            </div>
            <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
                <DialogContent className="bg-[#181920] border-none text-white w-[400px] sm:w-[600px] h-auto min-h-[400px] sm:min-h-[500px] flex flex-col poppins-medium">
                    <DialogHeader>
                    <DialogTitle>Creating New channel.</DialogTitle>
                    <DialogDescription>Select Peoples</DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder="Channel Name"
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                            onChange={(e) => setChannelName(e.target.value)}
                            value={channelName}
                        />
                    </div>
                    <div>
                        <MultipleSelector 
                            className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
                            value={selectedContacts}
                            options={allContacts}
                            placeholder="Search"
                            onChange={setSelectedContacts}
                            hideClearAllButton={true}
                            emptyIndicator = {
                                <p className="text-center text-sm font-bold sm:text-lg h-3 sm:h-4 text-gray-400">No Results found.</p>
                            }
                        />
                    </div>
                    <div className="mt-auto">
                        <Button className="w-full hover:bg-[#f59c0d]/60 bg-[#0c6aeb]/80 transition-all duration-300" onClick={createChannel}>
                            Create Channel
                        </Button>
                    </div>
                    
                </DialogContent>
            </Dialog>
            <Dialog open={searchChannelModal} onOpenChange={setSearchChannelModal}>
                <DialogContent className="bg-[#181920] border-none text-white w-[400px] sm:w-[600px] h-auto min-h-[450px] sm:min-h-[500px] flex flex-col poppins-medium">
                    <DialogHeader>
                        <DialogTitle>Search Channel</DialogTitle>
                        <DialogDescription>{searching ? 'Searching': searchName && searchedChannels!==0 ? `Result` : 'Channel'}</DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder="Search Channel"
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                    { searchedChannels.length > 0 && (
                        <ScrollArea className="h-[250px] mt-2 sm:mt-5">
                            <div className="flex flex-col gap-2 sm:gap-0">
                                {searchedChannels.map((channel) => (
                                    <div key={channel._id} className="flex gap-3 sm:gap-5 items-center cursor-pointer p-2 hover:bg-white/20 rounded-sm" onClick={() => selectChannel(channel)}>
                                        <div className="h-10 sm:h-12 w-10 sm:w-12 relative">
                                            <div className="bg-[#ffffff22] h-10 sm:h-12 w-10 sm:w-12 flex items-center justify-center rounded-full">#</div>
                                        </div>
                                        <div className="flex flex-col text-sm sm:text-[16px]">
                                            <span>
                                                {channel.name}
                                            </span>
                                            <span className="text-xs mt-0 sm:mt-1 text-white/50">
                                                {`Admin - ${channel.admin[0].email}`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                    {
                        searchedChannels.length<=0 && (
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

export default CreateChannel;