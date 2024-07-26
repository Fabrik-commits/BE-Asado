import dotenv from "dotenv";
import bcrypt from "bcrypt";
import https from "https";
import {User} from "../models/user.js";


dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_URL = process.env.BREVO_URL;

export async function forgot(req, res) {
    req.body.email = req.body.email.toLowerCase();
    const user = await User.findOne({email: req.body.email}).exec();
    if(!user) return res.status(404).send("User does not exist.");
    const code = Math.floor(Math.random() * 900000) + 100000;
    const salt = await bcrypt.genSalt(10);
    user.verificationCode = await bcrypt.hash(code.toString(), salt);
    await user.save();
    try {
        sendMail(user.email, user.name, code);
        res.status(200).send(`Mail sent succesfully to ${user.email}.`);
    } catch (error) {
        res.status(500).send(error);
    }
}


export async function verifyCode(req, res) {
    req.body.email = req.body.email.toLowerCase();
    const user = await User.findOne({email: req.body.email}).exec();
    if (!user) return res.status(404).send('User does not exist');
    const validCode = await bcrypt.compare(req.body.verificationCode, user.verificationCode);
    if (validCode) {
        return res.status(200).send('Verification code is correct.');
    } else {
        return res.status(400).send('Invalid verification code.');
    }
}


export async function recover(req, res) {
    req.body.email = req.body.email.toLowerCase();
    const user = await User.findOne({email: req.body.email}).exec();
    if (!user) return res.status(404).send('User does not exist.');
    if (user.verificationCode === null) return res.status(400).send('User never requested a password change.');
    const validCode = await bcrypt.compare(req.body.verificationCode, user.verificationCode);
    if (!validCode) return res.status(400).send('Invalid verification code.');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.verificationCode = null;
    await user.save();
    res.status(200).send("Password was updated correctly.");
}


function sendMail(email, name, code) {
    let data = JSON.stringify({
        "sender": {
            "name": "Eat-Asado",
            "email": "eat-asado-no-reply@vercel.app"
        },
        "to": [
            {
                "email": email,
                "name": name,
            }
        ],
        "subject": "Eat asado | Password recovery",
        "htmlContent": `<html><head></head><body><h1>Eat asado | Password recovery</h1><p>If you requested a password change insert this code into the prompted page:</p><h4>${code}</h4><p>If you didn't request a password change you can ignore this email.</p></body></html>`
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
