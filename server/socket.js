import { Server as SocketIOServer } from "socket.io"
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";
import { DateTime } from "luxon";

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {  // Setting Socket server with parameters
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    const userSocketMap = new Map();  //keep the socket connection details

    const disconnect = (socket) => {
        let disconnectedUserId = null;
        for(const [userId, socketId] of userSocketMap.entries()) {
            if(socketId === socket.id){
                disconnectedUserId = userId;
                userSocketMap.delete(userId);
                break;
            }
        }
        if(disconnectedUserId) {
            io.to(`status_${disconnectedUserId}`).emit('statusUpdate', {userId: disconnectedUserId, isOnline: false});
        }
        console.log(`Client Disconnected: ${socket.id}`);
    };

    const sendMessage = async (message) => {
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "id email firstName lastName image color")
            .populate("recipient", "id email firstName lastName image color");
        
        if(recipientSocketId) {
            io.to(recipientSocketId).emit("recieveMessage", messageData);
        }
        if(senderSocketId) {
            io.to(senderSocketId).emit("recieveMessage", messageData);
        }

    };

    const sendChannelMessage = async (message) => {
        const {channelId, sender, content, messageType, fileUrl} = message;
        const channel = await Channel.findById(channelId).populate("members");
        const members = channel.members;
        const verifyContact = members.find(member => member._id.toString() === sender);
        if(!(verifyContact || channel.admin[0]._id.toString() === sender)){
            return ;
        }

        const localTimeNow = DateTime.local().setZone("Asia/Kolkata").toJSDate();

        const createdMessage = await Message.create({
            sender,
            recipient: null,
            content,
            messageType,
            timestamp: localTimeNow,
            fileUrl,
        });

        const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "id email firstName lastName image color")
            .exec();

        await Channel.findByIdAndUpdate(channelId, {
            $push: {messages: createdMessage._id},
        });


        const finalData = { ...messageData._doc, channelId: channel._id};

        if(channel && channel.members){
            channel.members.forEach((member) => {
                const memberSocketId = userSocketMap.get(member._id.toString());
                if(memberSocketId){
                    io.to(memberSocketId).emit("recieve-channel-message", finalData);
                }
            });
            const adminSocketId = userSocketMap.get(channel.admin[0]._id.toString());
            if(adminSocketId){
                io.to(adminSocketId).emit("recieve-channel-message", finalData);
            }
        }
    };

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if(userId){
            userSocketMap.set(userId, socket.id);
            io.to(`status_${userId}`).emit('statusUpdate', {userId, isOnline: true});
            console.log(`User connected: ${userId} with socket Id: ${socket.id}`);
        } else {
            console.log("User Id not provided during connection.");
        }

        socket.on("subscribeToStatus", (userIdsToWatch) => {
            userIdsToWatch.forEach(id => {
                socket.join(`status_${id}`);

                if(userSocketMap.has(id)){
                    socket.emit("statusUpdate", {userId: id, isOnline: true});
                }
            });
        });

        socket.on("unsubscribeFromStatus", (userIdsToUnwatch) => {
            userIdsToUnwatch.forEach(id => {
                socket.leave(`status_${id}`);
            });
        });

        socket.on("sendMessage", sendMessage);
        socket.on("send-channel-message", sendChannelMessage);
        socket.on("disconnect", () => disconnect(socket));
    });
}

export default setupSocket;