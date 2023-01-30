import mongoose from "mongoose";
import dotenv from "dotenv";
import express, { json } from "express";
import router from "./router/index.js"
import users from "./router/users.js"

mongoose.set('strictQuery', true)

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

mongoose.connect(

    process.env.DATABASE_URL,

    { useNewUrlParser: true, useUnifiedTopology: true },
  
    (error) => {
  
      if (error) console.error(error);
  
      else console.log("Connected to Database");
  
    }
  
  );

app.use(express.json())
.use(express.urlencoded({ extended: false, limit: "5mb" }))
.use('/', router)
.use('/users', users)
.listen(PORT, () => console.log("Server Started"));


