import Lottie from "react-lottie";
import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";
import MessageContainer from "./components/message-container";
import { animationDefaultOptions } from "@/lib/utils";

const ChatContainer = () => {
    return (
        <div className="fixed top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex flex-col md:static md:flex-1 duration-500 transition-all">
            <div className="relative grid grid-cols-1 grid-rows-1 md:w-[65vw] lg:w-[70vw] xl:w-[70vw] w-full h-screen">
                <div className="col-start-1 row-start-1 flex flex-col justify-center items-center z-0 opacity-8 sm:opacity-5">
                    <Lottie
                        isClickToPauseDisabled={true}
                        height={300}
                        width={300}
                        options={animationDefaultOptions}
                    />
                    
                </div>
                <div className="col-start-1 row-start-1 flex flex-col bg-transparent z-10 h-full">
                    <ChatHeader />
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <MessageContainer />
                    </div>
                    <div className="mt-auto">
                        <MessageBar />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ChatContainer;