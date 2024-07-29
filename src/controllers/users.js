import bcrypt from "bcrypt";
import {User} from "../models/user.js";
import {Event} from "../models/event.js";


export async function getUsers(req, res){
    try {
        const users = await User.find().select("-password -verificationCode");
        return res.send(users);
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function getUserById(req, res) {
    try{
        const user = await User.findById(req.params.id).select("-password -verificationCode");
        if (!user) {
            return res.status(404).send("The user with the given ID was not found.");
        } else {
            return res.send(user);
        }
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function isDebtor(req, res) {
    const eventsWithoutReceipts = await Event.find({
                                                    "members": req.params.id,
                                                    "shoppingDesignee": {
                                                        $ne: req.params.id
                                                    },
                                                    "state": {
                                                        $nin: ["available", "full", "cancelled"]
                                                    }
    }).populate("transferReceipts");

    for (const event of eventsWithoutReceipts) {
        let hasReceipts = false
        for (const receipt of event.transferReceipts) {
            if (receipt.user == req.params.id && receipt.hasPaid) {
                hasReceipts = true
                break
            }
            if (receipt.user == req.params.id && (!receipt.hasPaid)) {
                return res.status(200).send({"eventId": event.id, "reason": "Receipt is not approved by Shopping Designee."})
            }
        }
        if (!hasReceipts) {
            return res.status(200).send({"eventId": event.id, "reason": "Transfer Receipt hasn't been uploaded yet."})
        }
    }
    return res.status(200).send({"eventId": null})
}


export async function register (req, res) {
    try{
        req.body.email = req.body.email.toLowerCase();
        const existingUser = await User.findOne({email: req.body.email});
        if (existingUser) return res.status(400).send('User already registered');
        let user = new User(req.body);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        user = await user.save();
        return res.status(201).send(user);
    } catch(e) {
        return res.status(500).send(e.message);
    }
}


export async function editUser (req, res) {
    try{
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).send("The user with the given ID was not found.");
        user.name = req.body.name ? req.body.name : user.name;
        user.lastName = req.body.lastName ? req.body.lastName : user.lastName;
        user.specialDiet = req.body.specialDiet;
        user.alias = req.body.alias;
        user.cbu = req.body.cbu;
        user = await user.save();
        return res.status(200).send(user);
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function editProfilePicture (req, res) {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("The user with the given ID was not found.");
    const imageId = await saveImage(req.file);
    user.profilePicture = imageId;
    user = await user.save();
    res.status(200).send(user);
}


export async function deleteUser(req, res) {
    try{
        const user = await User.findByIdAndRemove(req.params.id);
        if (!user) return res.status(404).send('The user with the given ID was not found.');
        return res.send(user);
    } catch(e){
        return res.status(500).send(e.message);
    }
}
