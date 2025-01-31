import express from "express";
import { createRating, getRatingFromUser } from "../controllers/ratings.js";
import { auth } from "../middleware/middleware.js";

const ratingsRouter = express.Router();

ratingsRouter.post(
    "/createRating/:event/:user", 
    [auth], 
    createRating
);

ratingsRouter.get(
    "/getRatingFromUser/:event/:user", 
    [auth], 
    getRatingFromUser
);

export default ratingsRouter;
