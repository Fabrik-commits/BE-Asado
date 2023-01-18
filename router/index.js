import {Router} from "express"
import UserService from "../services/user.service.js"


const router = Router();
const userService = new UserService()


router.get("/user/:id", userService.getOne.bind(userService));

router.post("/user", userService.create.bind(userService));


export default router