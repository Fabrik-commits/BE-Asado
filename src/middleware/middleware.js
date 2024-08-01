import {verify} from 'jsonwebtoken';
import dotenv from "dotenv";
import multer from 'multer';
import {Event} from "../models/event.js";
import {TransferReceipt} from "../models/transferReceipt.js";
import {isValidId} from "../utils/utils.js";


dotenv.config();
const jwtPrivateKey = process.env.JWTPRIVATEKEY;


export function auth(req, res, next){
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({message: "Access denied. No token provided."});

    try{
        const decoded = verify(token, jwtPrivateKey);
        req.user = decoded;
        next();
    } catch(error) {
        res.status(400).json({message: 'Invalid token.'});
    }
}


export async function eventOrganizer(req, res, next){
    try{
        if (!isValidId(req.params.id)) return res.status(400).json({message: "Invalid ID"});
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({message: "The event with the given ID does not exist."});
        if (event.organizer.toString() !== req.user._id) return res.status(403).json({message: "Access denied."});
        next();
    } catch(e) {
        res.status(500).json({message: e.message});
    }
}


export async function eventParticipant(req, res, next){
    try{
        if (!isValidId(req.params.event)) return res.status(400).json({message: "Invalid ID"});
        const event = await Event.findById(req.params.event);
        if (!event) return res.status(404).json({message: "The event with the given ID does not exist."});
        if (!(event.members.includes(req.user._id))) return res.status(403).json({message: "Access denied."});
        next();
    } catch(e) {
        res.status(500).json({message: e.message});
    }
}


const MIMETYPES = ["image/jpeg", "image/png", "application/pdf"];


export const multerUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (MIMETYPES.includes(file.mimetype)) cb(null, true)
        else cb(new Error(`Only ${MIMETYPES.join(' - ')} mimetypes are allowed.`))
    },
    limits: {
        fieldSize: 10000000
    }
});


export async function sameUser(req, res, next){
    try{
        if (!isValidId(req.user._id) || !isValidId(req.params.id)) return res.status(400).json({message: "Invalid ID"});
        if (req.params.id !== req.user._id) return res.status(403).json({message: "Access denied."});
        next();
    } catch(e) {
        res.status(500).json({message: e.message});
    }
}


export async function shoppingDesignee(req, res, next){
    try{
        if (!isValidId(req.user._id) || !isValidId(req.params.event)) return res.status(400).json({message: "Invalid ID"});
        const event = await Event.findById(req.params.event);
        if (!event) return res.status(404).json({message: "The event with the given ID does not exist."});
        if (event.shoppingDesignee.toString() !== req.user._id) return res.status(403).json({message: "Access denied."});
        next();
    } catch(e) {
        res.status(500).json({message: e.message});
    }
}


export async function transferReceiptOwner(req, res, next){
    try{
        if (!isValidId(req.params.id)) return res.status(400).json({message: "Invalid ID"});
        const transferReceipt = await TransferReceipt.findById(req.params.id);
        if (!transferReceipt) return res.status(404).json({message: "The transfer receipt with the given ID does not exist."});
        if (transferReceipt.user.toString() !== req.user._id) return res.status(403).json({message: "Access denied."});
        next();
    } catch(e) {
        res.status(500).json({message: e.message});
    }
}
