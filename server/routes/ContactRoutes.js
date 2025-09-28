import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getContactForDMList, searchContacts } from "../controllers/ContactsController.js";

const contactRoutes = Router();

contactRoutes.post("/search", verifyToken, searchContacts);
contactRoutes.get("/get-contacts-for-dm", verifyToken, getContactForDMList);

export default contactRoutes;