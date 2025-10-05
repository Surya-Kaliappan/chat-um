import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { createChannel, EditChannel, getChannel, getChannelMessages, getUserChannels, searchChannels } from "../controllers/ChannelController.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.post("/edit-channel", verifyToken, EditChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);
channelRoutes.get("/get-channel-messages/:channelId", verifyToken, getChannelMessages);
channelRoutes.post("/search", verifyToken, searchChannels);
channelRoutes.get("/get-channel/:channelId", verifyToken, getChannel);

export default channelRoutes;