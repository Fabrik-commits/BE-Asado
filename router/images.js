import {Router} from "express";
import {Image} from "../models/image.js";
import {auth} from "../middleware/auth.js";


const router = Router();

router.get('/getImage/:id', auth, async (req, res) => {
    const id = req.params.id;
    const image = await Image.findById(id);
    res.contentType(image.mimetype);
    res.status(200).send(image.image);
})

export default router;
