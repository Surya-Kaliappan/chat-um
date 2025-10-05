import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";
import MessageContainer from "./components/message-container";

const ChatContainer = () => {
    return (
        <div className="fixed top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex flex-col md:static md:flex-1">
            <ChatHeader />
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <MessageContainer />
            </div>
            <div className="mt-auto">
                <MessageBar />
            </div>
        </div>
    );
};

export default ChatContainer;