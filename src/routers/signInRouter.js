import express from "express";
import { login } from "../controllers/login.js";

const signInRouter = express.Router();

signInRouter.post(
    "/", 
    login
);

export default signInRouter;
