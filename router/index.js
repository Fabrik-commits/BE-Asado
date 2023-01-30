import {Router} from "express"


const router = Router();

router.get("", (req, res) => {res.send("Eat Asado API")});


export default router