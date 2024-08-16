import bcrypt from "bcrypt";
import {User} from "../models/user.js";
import {Image} from "../models/image.js";
import {Event} from "../models/event.js";
import {hasUploaded} from "./transferReceipts.js";
import {saveImage} from "./images.js";


export async function getUsers(req, res){
    try {
        const users = await User.find().select("-password -verificationCode");
        return res.status(200).json(users);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function getUserById(req, res) {
    try{
        const user = await User.findById(req.params.id).select("-password -verificationCode");
        if (!user) {
            return res.status(404).json({message: "The user with the given ID was not found."});
        } else {
            return res.status(200).json(user);
        }
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function isDebtor(req, res) {
    try {
        const eventsWithoutReceipts = await Event.find({
                                                        "members": req.params.id,
                                                        "shoppingDesignee": {
                                                            $ne: req.params.id
                                                        },
                                                        "state": "closed",
                                                        "purchaseReceipts": { 
                                                            "$exists": true, 
                                                            "$ne": [] 
                                                        }
        });

        for (const event of eventsWithoutReceipts) {
            const uploadInfo = await hasUploaded(req.params.id, event.id)
            if (uploadInfo.hasUploaded){
                if (uploadInfo.hasReceiptApproved){
                    continue
                } else {
                    return res.status(200).json({"eventId": event.id, "reason": "Receipt is not approved by Shopping Designee."})
                }
            } else {
                return res.status(200).json({"eventId": event.id, "reason": "Transfer Receipt hasn't been uploaded yet."})
            }
        }
        return res.status(200).json({"eventId": null, "reason": "User has no debts."})
    } catch(e) {
        return res.status(500).json({message: e.message})
    }
}


export async function register (req, res) {
    try{
        req.body.email = req.body.email.toLowerCase();
        const existingUser = await User.findOne({email: req.body.email});
        if (existingUser) return res.status(400).json({message: 'User already registered'});
        let user = new User(req.body);
        const salt = await bcrypt.genSalt(10);
        const passwordPattern = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$');
        if (!(passwordPattern.test(req.body.password))){
            return res.status(400).json({message: "Password doesn't match the requirements."});
        }
        user.password = await bcrypt.hash(user.password, salt);
        user = await user.save();
        return res.status(201).json(user);
    } catch(e) {
        return res.status(500).json({message: e.message});
    }
}


export async function editUser (req, res) {
    try{
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({message: "The user with the given ID was not found."});
        user.name = req.body.name ? req.body.name : user.name;
        user.lastName = req.body.lastName ? req.body.lastName : user.lastName;
        user.specialDiet = req.body.specialDiet;
        user.alias = req.body.alias;
        user.cbu = req.body.cbu;
        user = await user.save();
        return res.status(200).json(user);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function editProfilePicture (req, res) {
    try {
        if (req.file){
            let user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({message: "The user with the given ID was not found."});
            if (user.profilePicture) {
                const deletedImage = await Image.findOneAndDelete(user.profilePicture);
            }
            const imageId = await saveImage(req.file);
            user.profilePicture = imageId;
            user = await user.save();
            return res.status(200).json({"imageId": imageId});
        }
    } catch (e){
        return res.status(500).json({message: e.message});
    }
}


export async function deleteUser(req, res) {
    try{
        const user = await User.findByIdAndRemove(req.params.id);
        if (!user) return res.status(404).json({message: 'The user with the given ID was not found.'});
        return res.status(200).json(user);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}
