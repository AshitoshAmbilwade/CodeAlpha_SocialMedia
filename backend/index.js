import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";//must give extension because it's type is module
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import storyRoute from "./routes/story.route.js";
import reelsRoute from "./routes/reels.route.js";
import messageRoute from "./routes/message.route.js"

dotenv.config({});
const PORT = process.env.PORT || 3000;
const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));
//api calling done here
app.use("/api/v1/user",userRoute);
//"http://localhost:8000/api/v1/user/register"

app.use("/api/v1/post",postRoute);

app.use("/api/v1/reels",reelsRoute);

app.use("/api/v1/story",storyRoute);

app.use("/api/v1/message",messageRoute);


//sending data to server page
app.get("/", (_, res) => {
    return res.status(200).json({
        message: "from backend",
        success: true
    });
});


app.listen(PORT, () => {
    connectDB();
    console.log(`The server is running on port ${PORT}`);
});
