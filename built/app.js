import express from "express";
import cors from "cors";
import { connectDB } from "./connection/connection.js";
import router from "./router.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: "5mb" }));
const corsMethods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"];
app.use(cors({
    allowedHeaders: ["authorization", "Content-Type"],
    exposedHeaders: ["authorization"],
    origin: true,
    methods: corsMethods.join(","),
    preflightContinue: false,
}));
app.get("/", (req, res) => {
    res.json({ message: "This is the FoodSpot API" });
});
// routing
app.use("/api", router);
// connecting to database
connectDB();
export default app;
