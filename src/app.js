import express from 'express';
// import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './connection/connection.js';
import router from './router.js';


dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: "5mb" }));
// app.use(cookieParser());
app.use(cors({
        allowedHeaders: ["authorization", "Content-Type"],
        exposedHeaders: ["authorization"],
        origin: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false
    })
);

app.get('/', (req, res) => {
	res.json({
		message: 'This is the Eat Asado API'
	});
});

// routing
app.use('/api', router)

// connecting to database
await connectDB();

export default app;