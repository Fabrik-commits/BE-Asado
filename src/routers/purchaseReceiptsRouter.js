import express from "express";
import {
  getPurchaseReceiptsByEvent,
  getPurchaseReceiptById,
  assignMembersToReceipt,
  uploadFilePurchaseReceipt,
  createPurchaseReceipt,
  deletePurchaseReceipt,
} from "../controllers/purchaseReceipts.js";
import { auth, shoppingDesignee, eventParticipant, multerUpload } from "../middleware/middleware.js";

const purchaseReceiptRouter = express.Router();

purchaseReceiptRouter.get(
  "/getPurchaseReceiptsByEvent/:event",
  [auth, eventParticipant],
  getPurchaseReceiptsByEvent
);

purchaseReceiptRouter.get(
  "/getPurchaseReceiptById/:id/:event",
  [auth, eventParticipant],
  getPurchaseReceiptById
);

purchaseReceiptRouter.put(
  "/assignMembersToReceipt/:id",
  [auth, shoppingDesignee],
  assignMembersToReceipt
)

purchaseReceiptRouter.post(
  "/uploadFile/:purchaseReceipt",
  [auth, multerUpload.single("file")],
  uploadFilePurchaseReceipt
);

purchaseReceiptRouter.post(
  "/createPurchaseReceipt/:event",
  [auth, shoppingDesignee],
  createPurchaseReceipt
);

purchaseReceiptRouter.delete(
  "/deletePurchaseReceipt/:id/:event",
  [auth, shoppingDesignee],
  deletePurchaseReceipt
);

export default purchaseReceiptRouter;
