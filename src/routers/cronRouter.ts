import express from "express";
import { reminderCheck } from "../controllers/notifications.js";

const cronRouter: express.Router = express.Router();

cronRouter.get("/reminderCheck", reminderCheck);

export default cronRouter;
