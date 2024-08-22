import express from 'express';
import {auth, eventOrganizer, eventParticipant, multerUpload, multerUploadImages, sameUser, shoppingDesignee, transferReceiptOwner} from './middleware/middleware.js';
import {getEvents, getPublicEvents, getPublicAndPrivateEvents, getEventById, getMembersAndReceiptsInfo, createEvent, subscribeToAnEvent, unsubscribeFromEvent, editRoles, editEvent, deleteEvent} from "./controllers/events.js";
import {getImage} from "./controllers/images.js";
import {login} from './controllers/login.js';
import {getPurchaseReceiptsByEvent, getPurchaseReceiptById, uploadFilePurchaseReceipt, createPurchaseReceipt, deletePurchaseReceipt} from './controllers/purchaseReceipts.js';
import {forgot, verifyCode, recover} from "./controllers/password.js";
import {getTransferReceiptsByEvent, getTransferReceiptsById, uploadFileTransferReceipt, createTransferReceipt, approveTransferReceipt, deleteTransferReceipt} from "./controllers/transferReceipts.js";
import {getUsers, getUserById, isDebtor, register, editUser, editProfilePicture, deleteUser} from "./controllers/users.js";


const router = express.Router();


// events routes
router.get("/events/getEvents", auth, getEvents);
router.get("/events/getPublicEvents", getPublicEvents);
router.get("/events/getPublicAndPrivateEvents", auth, getPublicAndPrivateEvents);
router.get("/events/getEventById/:id", getEventById);
router.get("/events/getMembersAndReceiptsInfo/:event", getMembersAndReceiptsInfo);

router.post("/events/createEvent", auth, createEvent);

router.put("/events/subscribeToAnEvent/:id/:event", [auth, sameUser], subscribeToAnEvent);
router.put("/events/unsubscribeFromEvent/:id/:event", [auth, sameUser], unsubscribeFromEvent);
router.put("/events/editRoles/:id", auth, editRoles);
router.put("/events/editEvent/:id", [auth, eventOrganizer], editEvent);

router.delete('/events/deleteEvent/:id', [auth, eventOrganizer], deleteEvent);


//images routes
router.get('/images/getImage/:id', auth, getImage);


// login
router.post('/login', login);


// purchaseReceipts routes
router.get("/purchaseReceipts/getPurchaseReceiptsByEvent/:event", [auth, eventParticipant], getPurchaseReceiptsByEvent);
router.get("/purchaseReceipts/getPurchaseReceiptById/:id/:event", [auth, eventParticipant], getPurchaseReceiptById);

router.post("/purchaseReceipts/uploadFile/:purchaseReceipt", [auth, multerUpload.single('file')], uploadFilePurchaseReceipt);
router.post("/purchaseReceipts/createPurchaseReceipt/:event", [auth, shoppingDesignee], createPurchaseReceipt);

router.delete("/purchaseReceipts/deletePurchaseReceipt/:id/:event", [auth, shoppingDesignee], deletePurchaseReceipt);


// password routes
router.post("/password/forgot", forgot);

router.put("/password/verifyCode", verifyCode);
router.put("/password/recover", recover);


// transferReceipts routes
router.get("/transferReceipts/getTransferReceiptsByEvent/:event", [auth, shoppingDesignee], getTransferReceiptsByEvent);
router.get("/transferReceipts/getTransferReceiptsById/:id", auth, getTransferReceiptsById);

router.post("/transferReceipts/uploadFile/:transferReceipt", [auth, multerUpload.single('file')], uploadFileTransferReceipt);
router.post("/transferReceipts/createTransferReceipt/:event", auth, createTransferReceipt);

router.put('/transferReceipts/approveTransferReceipt/:id/:event', [auth, shoppingDesignee], approveTransferReceipt);

router.delete('/transferReceipts/deleteTransferReceipt/:id', [auth], deleteTransferReceipt);


//users routes
router.get("/users/getUsers", auth, getUsers);
router.get("/users/getUserById/:id", auth, getUserById);
router.get("/users/isDebtor/:id", auth, isDebtor);

router.post("/users/register", register);

router.put("/users/editUser/:id", [auth, sameUser], editUser);
router.put("/users/editProfilePicture/:id", [auth, sameUser, multerUploadImages.single("file")], editProfilePicture);

router.delete('/users/deleteUser/:id', [auth, sameUser] , deleteUser);


export default router;
