import {Router} from "express";
import PurchaseReceipt from "../services/purchaseReceipt.service.js";


const router = Router();
const purchaseReceipt = new PurchaseReceipt();


router.get("/", purchaseReceipt.getMany.bind(purchaseReceipt));

router.get("/:id", purchaseReceipt.getOne.bind(purchaseReceipt));

router.post("/", purchaseReceipt.create.bind(purchaseReceipt));

export default router;
