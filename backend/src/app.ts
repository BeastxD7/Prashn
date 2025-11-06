import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import UserRouter from './routes/user.route'
import QuizRouter from './routes/quiz.route'
import AgentRouter from './routes/agent.route'
import cors from 'cors';
import DashboardRouter from './routes/dashboard.route'
import PaymentRouter from './routes/payments.route'
import { generalRateLimiter } from './middleware/rateLimit'

const app = express()

const PORT = process.env.PORT || 3002;
// Allow the local frontend during development. Use an env var in production for security.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000' || 'https://localhost:5173';
app.use(
    cors({
        origin: FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
        credentials: true,
    })
);

// HTTP request logger
const isProd = process.env.NODE_ENV === 'production';
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json())
// Parse cookies so `cookieAuth` middleware can read `req.cookies.access_token`
app.use(cookieParser());
// Apply a global rate limiter to mitigate brute-force attempts and abuse
app.use(generalRateLimiter);

app.get("/", (_req, res)=> {
    res.json({message: "Hello World!"})
})

app.use("/api/users", UserRouter)
app.use("/api/quiz", QuizRouter)
app.use("/api/agent", AgentRouter);
app.use("/api/dashboard", DashboardRouter);
app.use("/api/payment", PaymentRouter);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})