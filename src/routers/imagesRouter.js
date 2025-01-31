import express from "express";
import { getImage } from "../controllers/images.js";
import { auth } from "../middleware/middleware.js";

const imageRouter = express.Router();

imageRouter.get(
    "/getImage/:id",
    auth, 
    getImage
);

export default imageRouter;
