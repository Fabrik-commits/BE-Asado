import {Router} from "express"

const router = Router()

router.get("/", (_req, res) => {

    console.log("aa")

    res.send("aa")

    }
);

export default router