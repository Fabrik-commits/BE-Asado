import express from "express";
import { auth } from "../middleware/middleware.js";
import { getMembersWhoHaventVoted, createOption, deleteOption, editOptions, } from "../controllers/options.js";
const optionRouter = express.Router();
optionRouter.get("/getMembersWhoHaventVoted/:event", auth, getMembersWhoHaventVoted);
optionRouter.post("/createOption/:event", auth, createOption);
optionRouter.put("/editOption/:id", auth, editOptions);
optionRouter.delete("/deleteOption/:id", auth, deleteOption);
export default optionRouter;
