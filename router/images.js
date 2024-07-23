import {Router} from "express";
import {Image} from "../models/image.js";
import {auth} from "../middleware/auth.js";


const router = Router();

router.get('/getImage/:id', auth, async (req, res) => {
    try{
        const id = req.params.id;
        const image = await Image.findById(id);
        console.log(id)
        res.contentType(image.mimetype);
        res.status(200).send(image.image);
    } catch {
        res.status(500).send(e.message);
    }
})

export default router;
