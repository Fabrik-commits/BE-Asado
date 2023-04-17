import dotenv from "dotenv";
import {Router} from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import {User} from "../models/user.js";

dotenv.config();

const emailAddress = process.env.EMAIL_ADDRESS;
const emailPass = process.env.EMAIL_PASS;


const router = Router();

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailAddress,
        pass: emailPass
    }
})


router.post("/forgot", async (req, res) => {

    const user = await User.findOne({email: req.body.email}).exec();

    if(!user){
        return res.status(404).send("The user with the given ID was not found.");
    }

    const code = Math.floor(Math.random() * 900000) + 100000;
    const salt = await bcrypt.genSalt(10);
    user.verificationCode = await bcrypt.hash(code.toString(), salt);
    await user.save();

    let mailOptions = {
        from: emailAddress,
        to: "ignaciocurtijristo@gmail.com",
        subject: "Password recovery",
        html: `<h1>Did you forgot your password?</h1><p>Your authentication code is <h3>${code}<h3/>. Please copy and paste it into the prompted page of the app.</p>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err){
            return res.status(500).send(err.message);
        } else {
            return res.status(200).send(`Email sent succesfully. ${info.response}`);
        }
    } )
});


router.post("/recover", async (req, res)=>{
    const user = await User.findOne({email: req.body.email}).exec();
    if (!user) return res.status(404).send('User does not exist');
    const validCode = await bcrypt.compare(req.body.verificationCode, user.verificationCode);
    if (!validCode) return res.status(400).send('Invalid verification code');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save()
    res.status(200).send("Password was updated correctly.")
})

export default router;
