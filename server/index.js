import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 1234;
const databaseURL = process.env.DATABASE_URL;

app.use(cors({
    origin: process.env.ORIGIN, // get request from this link
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],  // REST Operations
    credentials: true,  // to enable cookies
}));

app.use("/uploads/profiles", express.static("uploads/profiles"));

app.use(cookieParser());  // getting cookies from frontend
app.use(express.json());  // getting payload from the request

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes)

const server = app.listen(port, () => {
    console.log(`Server is running.. http://localhost:${port}`);
});

setupSocket(server);

mongoose.connect(databaseURL)   // Connect to the Database
.then(() => console.log("Database connected")).catch(err => console.log(err.message));
