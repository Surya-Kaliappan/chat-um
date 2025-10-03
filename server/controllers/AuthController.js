import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000;  // 3 Days of Expire

const createToken = (email, userId) => {
    return jwt.sign({email, userId}, process.env.JWT_KEY, {expiresIn: maxAge});  // Creating Token
}

export const signup = async (request, response, next) => {
    try{
        const {email, password} = request.body;
        if(!email || !password){
            return response.status(400).send("Email and Password is required.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);  // Hashing password with 10 rounds
        const user = await User.create({email, password: hashedPassword});
        response.cookie("jwt", createToken(email, user.id), {   // adding cookie to response with token
            maxAge, 
        });
        return response.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
            },
        })

    } catch(error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
};

export const login = async (request, response, next) => {
    try {
        const {email, password} = request.body;
        if(!email || !password) {
            return response.status(400).send("Email and password is requied.");
        }
        const user = await User.findOne({email});  // Getting one result from the database
        if(!user){
            return response.status(404).send("User with the given email not found.");
        }
        const auth = await bcrypt.compare(password, user.password);  // compare the normal password with hashed password
        if(!auth){
            return response.status(400).send("Password is incorrect.");
        }
        response.cookie("jwt", createToken(email, user.id), {  // Creating Cookie with token as same as Signup
            maxAge,
        });
        return response.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            },
        });
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
};

export const getUserInfo = async (request, response, next) => {
    try{
        const userData = await User.findById(request.userId);
        if(!userData) {
            return response.status(404).send("User with given id not found.");
        }

        return response.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
}

export const updateProfile = async (request, response, next) => {
    try {
        const {userId} = request;
        const {firstName, lastName, color} = request.body;
        if(!firstName || !lastName){
            return response.status(400).send("Firstname, Lastname and color is required.");
        }

        const userData = await User.findByIdAndUpdate(userId,
            {
                firstName,
                lastName,
                color,
                profileSetup: true,
            },
            { new: true, runValidators: true } // runValidators to check the errors in data and new as true for return the data
        );

        return response.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
};

export const addProfileImage = async (request, response, next) => {
    try{
        if(!request.file){
            return response.status(400).send("File is required");
        }

        const date = Date.now();
        let fileName = "uploads/profiles/" + date + request.file.originalname;
        renameSync(request.file.path, fileName);  // Creating the new file in the given path
        
        const updatedUser = await User.findByIdAndUpdate(request.userId, {image: fileName}, {new: true, runValidators: true});

        return response.status(200).json({
            image: updatedUser.image,
        });
    } catch (error) {
        console.log({error});
    }
};

export const removeProfileImage = async (request, response, next) => {
    try{
        const {userId} = request;
        const user = await User.findById(userId);

        if(!user){
            return response.status(404).send("User not found.");
        }
        if(user.image){
            unlinkSync(user.image); // remove the image from the folder
        }
        user.image = null;
        await user.save();

        return response.status(200).send("Profile image removed successfully.");
    } catch (error) {
        console.log({error});
    }
};

export const logout = async (request, response, next) => {
    try{
        response.cookie("jwt", "", {maxAge: 1});  // update the cookie to expire in 1ms
        return response.status(200).send("Logout Successfully");
    } catch (error) {
        return response.status(500).send("Internal Server Error");
    }
};