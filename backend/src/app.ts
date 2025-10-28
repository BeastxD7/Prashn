import express from 'express'
import cookieParser from 'cookie-parser'
import UserRouter from './routes/user.route'
import QuizRouter from './routes/quiz.route'
import AgentRouter from './routes/agent.route'
import cors from 'cors';
import DashboardRouter from './routes/dashboard.route'

const app = express()
// Allow the local frontend during development. Use an env var in production for security.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173' || 'https://localhost:5173';
app.use(
    cors({
        origin: FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);
app.use(express.json())
// Parse cookies so `cookieAuth` middleware can read `req.cookies.access_token`
app.use(cookieParser());

app.get("/", (_req, res)=> {
    res.json({message: "Hello World!"})
})

app.use("/api/users", UserRouter)
app.use("/api/quiz", QuizRouter)
app.use("/api/agent", AgentRouter);
app.use("/api/dashboard", DashboardRouter);

app.listen(3002, () => {
    console.log("Server is running on port 3000")
})