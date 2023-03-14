import {Router} from "express";
import {User} from "../models/user.js";


const router = Router();


router.get("/", async (req, res) => {
    const users = await User.find();
    res.send(users);
});


router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404).send("The user with the given ID was not found.");
        return;
    } else {
        res.send(user);
    }
});


router.post("/", async (req, res) => {
    try{
        let user = new User(req.body)
        user = await user.save()
        res.send(user)
    } catch (e) {
        res.send(e.message)
    }
});


export default router;
