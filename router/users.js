import {Router} from "express";
import {User} from "../models/user.js";
import {auth} from "../middleware/auth.js"


const router = Router();


router.get("/", auth, async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch(e){
        res.status(500).send(e.message)
    }
});


router.get("/:id", auth, async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).send("The user with the given ID was not found.");
            return;
        } else {
            res.send(user);
        }
    } catch(e){
        res.status(500).send(e.message)
    }
});


router.post("/", async (req, res) => {
    try{
        let user = new User(req.body)
        user = await user.save()
        res.send(user)
    } catch(e){
        res.status(500).send(e.message)
    }
});


export default router;
