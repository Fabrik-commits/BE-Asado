import {Router} from "express";
import TransferReceipt from "../services/transferReceipt.service.js";


const router = Router();
const transferReceipt = new TransferReceipt();


router.get("/", transferReceipt.getMany.bind(transferReceipt));

router.get("/:id", transferReceipt.getOne.bind(transferReceipt));

router.post("/", transferReceipt.create.bind(transferReceipt));

export default router;
