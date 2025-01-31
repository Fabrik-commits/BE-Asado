import express from "express";
import { getImage } from "../controllers/images";
import { auth } from "../middleware/middleware";

const imageRouter = express.Router();

imageRouter.get(
    "/getImage/:id",
    auth, 
    getImage
);

export default imageRouter;
