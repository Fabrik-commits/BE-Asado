import dotenv from "dotenv";
import bcrypt from "bcrypt";
import https from "https";
import {User} from "../models/user.js";


dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_URL = process.env.BREVO_URL;
const ADMIN_MAIL = process.env.ADMIN_MAIL;

export async function forgot(req, res) {
    try {
        req.body.email = req.body.email.toLowerCase();
        const user = await User.findOne({email: req.body.email}).exec();
        if(!user) return res.status(404).json({message: "User does not exist."});
        const code = Math.floor(Math.random() * 900000) + 100000;
        const salt = await bcrypt.genSalt(10);
        user.verificationCode = await bcrypt.hash(code.toString(), salt);
        await user.save();
        const dummyMessage = `<html><head></head><body><h1>FoodSpot</h1><p>${user.name} ${user.lastName} con el mail ${user.email} pidio recuperar contraseña. Su código es ${code}</p></body></html>`;
        setTimeout(() => {
            sendMail(ADMIN_MAIL, "Admin", dummyMessage)
        }, 1000);
        const message = `<html><head></head><body><h1>FoodSpot | Password recovery</h1><p>If you requested a password change insert this code into the prompted page:</p><h4>${code}</h4><p>If you didn't request a password change you can ignore this email.</p></body></html>`
        setTimeout(() => {
            sendMail(user.email, user.name, message)
        }, 1000);
        return res.status(200).json({message: `Mail sent succesfully to ${user.email}.`});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}


export async function verifyCode(req, res) {
    try {
        req.body.email = req.body.email.toLowerCase();
        const user = await User.findOne({email: req.body.email}).exec();
        if (!user) return res.status(404).json({message: 'User does not exist'});
        const validCode = await bcrypt.compare(req.body.verificationCode, user.verificationCode);
        if (validCode) {
            return res.status(200).json({message: 'Verification code is correct.'});
        } else {
            return res.status(400).json('Invalid verification code.');
        }
    } catch (e) {
        return res.status(500).json({message: error.message});
    }
}


export async function recover(req, res) {
    try {
        req.body.email = req.body.email.toLowerCase();
        const user = await User.findOne({email: req.body.email}).exec();
        if (!user) return res.status(404).json({message: 'User does not exist.'});
        if (user.verificationCode === null) return res.status(400).json({message: 'User never requested a password change.'});
        const validCode = await bcrypt.compare(req.body.verificationCode, user.verificationCode);
        if (!validCode) return res.status(400).json({message: 'Invalid verification code.'});
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.verificationCode = null;
        await user.save();
        return res.status(200).json({message: "Password was updated correctly."});
    } catch (e) {
        return res.status(500).json({message: error.message});
    }
}


function sendMail(email, name, message) {
    let data = JSON.stringify({
        "sender": {
            "name": "FoodSpot",
            "email": "food-spot-no-reply@vercel.app"
        },
        "to": [
            {
                "email": email,
                "name": name,
            }
        ],
        "subject": "FoodSpot | Password recovery",
        "htmlContent": message
    });
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json',
            'Content-Length': data.length,
        }
    };
    const url = BREVO_URL;
    let req = https.request(url, options, (res) => {
            res.on('data', (d) => {});
    });
    req.on('error', (e) => {
        throw e
    });
    req.write(data);
    req.end();
}
