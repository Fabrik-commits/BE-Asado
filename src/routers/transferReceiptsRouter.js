import express from "express";
import {
  getTransferReceiptsByEvent,
  getTransferReceiptsById,
  uploadFileTransferReceipt,
  createTransferReceipt,
  approveTransferReceipt,
  deleteTransferReceipt,
} from "../controllers/transferReceipts.js";
import {
  auth,
  shoppingDesignee,
  multerUpload,
} from "../middleware/middleware.js";

const transferReceiptRouter = express.Router();

transferReceiptRouter.get(
  "/getTransferReceiptsByEvent/:event",
  [auth, shoppingDesignee],
  getTransferReceiptsByEvent
);
transferReceiptRouter.get(
  "/getTransferReceiptsById/:id",
  auth,
  getTransferReceiptsById
);

transferReceiptRouter.post(
  "/uploadFile/:transferReceipt",
  [auth, multerUpload.single("file")],
  uploadFileTransferReceipt
);
transferReceiptRouter.post(
  "/createTransferReceipt/:event",
  auth,
  createTransferReceipt
);

transferReceiptRouter.put(
  "/approveTransferReceipt/:id/:event",
  [auth, shoppingDesignee],
  approveTransferReceipt
);

transferReceiptRouter.delete(
  "/deleteTransferReceipt/:id",
  [auth],
  deleteTransferReceipt
);

export default transferReceiptRouter;
