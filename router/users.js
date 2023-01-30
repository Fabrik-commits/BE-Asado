import {Router} from "express"
import UserService from "../services/user.service.js"


const router = Router();
const userService = new UserService()


router.get("/", userService.getMany.bind(userService));

router.get("/:id", userService.getOne.bind(userService));

router.post("/", userService.create.bind(userService));

export default router
