import express from 'express'
import cookieParser from 'cookie-parser'
import UserRouter from './routes/user.route'
import QuizRouter from './routes/quiz.route'
import AgentRouter from './routes/agent.route'
import cors from 'cors';

const app = express()
app.use(cors(
    {
        origin: 'https://localhost:5173', // Replace with your frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }
));
app.use(express.json())
// Parse cookies so `cookieAuth` middleware can read `req.cookies.access_token`
app.use(cookieParser());

app.get("/", (_req, res)=> {
    res.json({message: "Hello World!"})
})

app.use("/api/users", UserRouter)
app.use("/api/quiz", QuizRouter)
app.use("/api/agent", AgentRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})