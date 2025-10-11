import { apiClient } from "@/lib/api-client";
import NewDM from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNELS_ROUTE } from "@/utils/constants";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import ContactList from "@/components/contact-list";
import CreateChannel from "./components/create-channel";
import { useStatusSubscription } from '@/hooks/useStatusSubscription.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ContactsContainer = () => {

  const {setDirectMessagesContacts, directMessagesContacts, channels, setChannels} = useAppStore();

  const [contactIds, setContactIds] = useState([]);

  useStatusSubscription(contactIds);

  useEffect(() => {
    const getContacts = async () => {
      const response = await apiClient.get(GET_DM_CONTACTS_ROUTES, {
        withCredentials: true,
      });
      if(response.data.contacts){
        setDirectMessagesContacts(response.data.contacts);
        if(response.data.contacts.length > 0){
          const fetchedContactIds = response.data.contacts.map(contact => contact._id);
          setContactIds(fetchedContactIds);
        }
      }
    }

    const getChannels = async () => {
      const response = await apiClient.get(GET_USER_CHANNELS_ROUTE, {
        withCredentials: true,
      });
      if(response.data.channels){
        setChannels(response.data.channels);
      }
    };

    getContacts();
    getChannels();
  }, [setChannels, setDirectMessagesContacts]);

  return(
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[30vw] bg-[#1b1c24] border-r-0 sm:border-r-5 border-[#2f303b] w-full flex flex-col h-screen">
        <div className="pt-0 sm:pt-3">
            <Logo />
        </div>
        <Tabs defaultValue="channel" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="bg-transparent rounded-none w-full mb-2 sm:mb-1 px-5">
            <TabsTrigger value="channel"
            className="data-[state=active]:bg-transparent text-sm sm:text-md text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:border-b-white/80 p-5 cursor-pointer transition-all duration-300">Groups</TabsTrigger>
            <TabsTrigger value="dm" 
            className="data-[state=active]:bg-transparent text-sm sm:text-md text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:border-b-white/80 p-5 cursor-pointer transition-all duration-300">DM</TabsTrigger>
          </TabsList>
          <TabsContent value="dm" className="flex-1 flex flex-col min-h-0">
            <div className="my-3 flex flex-col flex-1 px-3">
              <div className="flex items-center justify-between pr-7 sm:pr-10 md:pr-8">
                  <Title text="Direct Messages" />
                  <NewDM />
              </div>
              <div 
                  className="overflow-y-auto custom-scrollbar"
                  style={{ height: 'calc(100vh - 170px - 4rem)' }}
              >
                  <ContactList contacts={directMessagesContacts} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="channel" className="flex-1 flex flex-col min-h-0">
            <div className="my-3 flex flex-col flex-1 px-3">
              <div className="flex items-center justify-between pr-7 sm:pr-10 md:pr-8">
                  <Title text="Channels" />
                  <CreateChannel />
              </div>
              <div 
                  className="overflow-y-auto custom-scrollbar"
                  style={{ height: 'calc(100vh - 170px - 4rem)' }}
              >
                  <ContactList contacts={channels} isChannel={true} />                
              </div>
            </div>
          </TabsContent>
        </Tabs>
  
        <ProfileInfo />
    </div>
  );
}

export default ContactsContainer;


const Logo = () => {
  return (
    <div className="flex p-5  justify-start items-center gap-2">
      <svg
        id="logo-38"
        className="w-[58px] h-[24px] md:w-[78px] md:h-[32px]"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          className="ccustom"
          fill="#ec9e38ff"
        ></path>{" "}
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          className="ccompli1"
          fill="#ed9f5aff"
        ></path>{" "}
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          className="ccompli2"
          fill="#e89f6eff"
        ></path>{" "}
      </svg>
      <span className="text-2xl md:text-3xl font-semibold ">Chat-UM</span>
    </div>
  );
};

const Title = ({text}) => {
    return (
        <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">{text}</h6>
    );
}