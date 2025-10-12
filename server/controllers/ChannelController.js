import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";
import channel from "../models/ChannelModel.js";


export const createChannel = async (request, response, next) => {
    try{
        const {name, members} = request.body;

        const userId = request.userId;

        const admin = await User.findById(userId);

        if(!admin){
            return response.status(400).send("Admin user not found.");
        }

        const validMembers = await User.find({_id:{$in:members}});  // checking the presence of all memebers in the database
        if(validMembers.length !== members.length){
            return response.status(400).send("Some members are not Valid users.");
        }

        const isAlreadyCreated = await Channel.findOne({name: name});
        if(isAlreadyCreated !== null){
            return response.status(409).send("Channel Name already exists");
        }

        const newChannel = new Channel({
            name, members, admin: userId,
        });
        await newChannel.save();
        const channel = {
            _id: newChannel._id,
            admin: [{_id: admin._id, email: admin.email}],
            members: newChannel.members,
            name: newChannel.name,
        };
        return response.status(201).json({channel: channel});
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
};

export const EditChannel = async (request, response, next) => {
    try{
        const userId = request.userId;
        const admin = await User.findById(userId);
        if(!admin){
            return response.status(400).send("Admin user not found.");
        }
        const {channelId, name, members} = request.body;
        if(!channelId){
            return response.status(400).send("Channel ID is required.");
        }
        const validMembers = await User.find({_id:{$in:members}});  // checking the presence of all memebers in the database
        if(validMembers.length !== members.length){
            return response.status(400).send("Some members are not Valid users.");
        } 
        const channelData = await Channel.findByIdAndUpdate(channelId,
            {
                name,
                members,
            },
            { new: true, runValidators: true } // runValidators to check the errors in data and new as true for return the data
        );
        const channel = {
            _id: channelData._id,
            admin: [{_id: admin._id, email: admin.email}],
            members: channelData.members,
            name: channelData.name,
        };
        // console.log(channel);
        return response.status(201).json({channel: channel});

    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
};

export const getUserChannels = async (request, response, next) => {
    try{
        const userId = new mongoose.Types.ObjectId(request.userId);  // store the data as ObjectId type
        const channels = await Channel.find({
            $or: [{admin: userId}, {members: userId}],
        }).select("_id name admin members").populate({
            path: "admin",
            select: "email"
        }).sort({updatedAt: -1}); // sort in descending order of time

        return response.status(201).json({channels});
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
};

export const getChannelMessages = async (request, response, next) => {
    try{
        const {channelId} = request.params;  // getting channelId from the link(params)
        const channel = await Channel.findById(channelId).populate({
            path: "messages", 
            populate: {
                path: "sender",
                select: "firstName lastName email _id image color",
            },
        });
        if(!channel) {
            return response.status(404).send("Channel not found.");
        }
        const messages = channel.messages;
        return response.status(201).json({messages});
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
};

export const searchChannels = async (request, response, next) => {
    try{
        const {searchTerm} = request.body;

        if(searchTerm === undefined || searchTerm === null){
            return response.status(400).send("SearchTerm is required");
        }
        const sanitizedSearchTerm = searchTerm.replace(   // sanitize input for regex
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const regex = new RegExp(sanitizedSearchTerm, "i");

        // const channels = await Channel.find({name: regex}).select("_id name admin").populate({
        //     path: "admin",
        //     select: "_id email firstName lastName"
        // });

        const channels = await Channel.aggregate([
            {  // search for users whose email matches the search
                $lookup: {
                    from: "users",
                    localField: "admin",
                    foreignField: "_id",
                    as: "adminDetails"
                },
            },
            // add virtual field to check for matches in channel name or admin email
            {
                $addFields: {
                    // check if the channel name matches the regex 
                    nameMatches: {$regexMatch: {input: "$name", regex: regex}},
                    // check if ANY admin's email matches the regex
                    adminEmailMatches: {
                        $gt: [{
                            $size: {
                                $filter: {
                                    input: "$adminDetails",
                                    as: "admin",
                                    // check if the admin's email matches the regex
                                    cond: {$regexMatch: {input: "$$admin.email", regex: regex}}
                                },
                            }
                        }, 0],
                    }
                }
            },
            // keep channels where either name or admin email matches
            {
                $match: {
                    $or: [
                        {nameMatches: true},
                        {adminEmailMatches: true}
                    ],
                }
            },
            // clean up the output and format the admin field
            {
                $project: {
                    _id: 1,
                    name: 1,
                    admin: {$map: {
                        input: "$adminDetails",
                        as: "admin",
                        in: {
                            _id: "$$admin._id",
                            email: "$$admin.email",
                            firstName: "$$admin.firstName",
                            lastName: "$$admin.lastName"
                        }
                    }},
                }
            }
        ]);
        return response.status(200).json({channels});
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
};

export const getChannel = async (request, response, next) => {
    try{
        const {channelId} = request.params;
        if(channelId === undefined || channelId === null){
            return response.status(400).send("Channel Id is required.");
        }
        const channel = await Channel.findOne({_id: channelId});

        return response.status(200).json({channel});
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
};