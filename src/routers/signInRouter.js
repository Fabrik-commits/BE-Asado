import express from "express";
import { login } from "../controllers/login";

const signInRouter = express.Router();

signInRouter.post("/", login);

export default signInRouter;
