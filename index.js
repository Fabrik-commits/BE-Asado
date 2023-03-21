import mongoose from "mongoose";
import dotenv from "dotenv";
import express, { json } from "express";
import router from "./router/index.js";
import login from "./router/login.js";
import users from "./router/users.js";
import events from "./router/events.js";
import transferReceipt from "./router/transferReceipts.js";
import purchaseReceipt from "./router/purchaseReceipts.js";


mongoose.set('strictQuery', true);

dotenv.config();


const app = express();

const PORT = process.env.PORT || 3000;


mongoose.connect(
    process.env.DATABASE_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (error) => {
        if (error) {
            console.error(error);
        }else {
        console.log("Connected to Database");
        }
    }
);

app.use(express.json())
.use(express.urlencoded({ extended: false, limit: "5mb" }))
.use('/', router)
.use('/users', users)
.use('/login', login)
.use('/events', events)
.use('/transfer-receipt', transferReceipt)
.use('/purchase-receipt', purchaseReceipt)
.listen(PORT, () => console.log("Server Started")); 
