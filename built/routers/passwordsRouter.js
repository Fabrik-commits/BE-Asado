import express from "express";
import { forgot, verifyCode, recover } from "../controllers/password.js";
const passwordRouter = express.Router();
passwordRouter.post("/forgot", forgot);
passwordRouter.put("/verifyCode", verifyCode);
passwordRouter.put("/recover", recover);
export default passwordRouter;
