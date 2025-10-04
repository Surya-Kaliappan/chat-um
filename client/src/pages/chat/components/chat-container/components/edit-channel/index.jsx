import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react";
import { MdMoreVert } from 'react-icons/md';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { EDIT_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTES } from "@/utils/constants";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";
import { toast } from "sonner";

const EditChannel = () => {
    const {updateChannelInChannelList, selectedChatData, setSelectedChatData} = useAppStore();
    const [newChannelModal, setNewChannelModal] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState();
    const [channelName, setChannelName] = useState("");
    const [updateBtn, setUpdateBtn] = useState(true);
    
    useEffect(() => {
        const getData = async () => {
            const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
                withCredentials: true,
            });
            setAllContacts(response.data.contacts);
        };
        getData();
    }, []);

    useEffect(() => {
        const areIdListDifferent = (idList, objectList) => {
            const objectIdList = objectList.map(obj => obj.value);
            const idListSet = new Set(idList);
            const objectIdListSet = new Set(objectIdList);
            if(idListSet.size !== objectIdListSet.size){
                return false;
            }
            const isEveryIdPresent = [...idListSet].every(value => objectIdListSet.has(value));
            return isEveryIdPresent ? true : false;
        }
        if(selectedChatData.name === channelName)
        setUpdateBtn(areIdListDifferent(selectedChatData.members, selectedContacts));
        else setUpdateBtn(false);
    }, [selectedContacts, channelName]);

    const getDetailsOfIds = (ids) => {
        return allContacts.filter(contact => ids.includes(contact.value));
    }
    
    useEffect(() => {
        const memberIds = selectedChatData ? selectedChatData.members : [];
        setChannelName(selectedChatData.name);
        setSelectedContacts(getDetailsOfIds(memberIds));
    }, [allContacts]);

    const createChannel = async () => {
        try{
            if(channelName.length > 0 && selectedContacts.length > 0){
                const response = await apiClient.post(
                    EDIT_CHANNEL_ROUTE, 
                    {
                        channelId: selectedChatData._id,
                        name: channelName,
                        members: selectedContacts.map((contact) => contact.value),
                    },
                    {withCredentials: true},
                );
                if(response.status===201){
                    setChannelName(response.data.channel.name);
                    setSelectedContacts(getDetailsOfIds(response.data.channel.members));
                    setNewChannelModal(false);
                    updateChannelInChannelList(response.data.channel);
                    setSelectedChatData(response.data.channel);
                    toast.success("Channel Updated..");
                } else {
                    toast.error("Something Went Wrong");
                }
            }
        } catch (error) {
            console.log({error});
        }
    }

    return (
        <>
            <Tooltip>
                <TooltipTrigger>
                    <MdMoreVert className="text-2xl text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" 
                        onClick={() => setNewChannelModal(true)}
                    />
                </TooltipTrigger>
                <TooltipContent
                    className="border-none p-3 text-white"
                >
                    Edit Channel
                </TooltipContent>
            </Tooltip>
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
                        <Button className="w-full hover:bg-[#f59c0d]/60 bg-[#0c6aeb]/80 transition-all duration-300" onClick={createChannel} 
                        disabled={updateBtn}>
                            Update Channel
                        </Button>
                    </div>
                    
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EditChannel;