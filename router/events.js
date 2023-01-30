import {Router} from "express";
import EventService from "../services/event.service.js";;


const router = Router();
const eventService = new EventService();


router.get("/", eventService.getMany.bind(eventService));

router.get("/:id", eventService.getOne.bind(eventService));

router.post("/", eventService.create.bind(eventService));

export default router;