import { Server as SocketIOServer } from "socket.io"

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
        for(const [userId, socketId] of userSocketMap.entries()) {
            if(socketId === socket.id){
                userSocketMap.delete(userId);
                break;
            }
        }
        console.log(`Client Disconnected: ${socket.id}`);
    }

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if(userId){
            userSocketMap.set(userId, socket.id);
            console.log(`User connected: ${userId} with socket Id: ${socket.id}`);
        } else {
            console.log("User Id not provided during connection.");
        }

        socket.on("disconnect", () => disconnect(socket));
    });
}

export default setupSocket;