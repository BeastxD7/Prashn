import express from 'express'
import UserRouter from './routes/user.route'
import QuizRouter from './routes/quiz.route'
import AgentRouter from './routes/agent.route'


const app = express()

app.use(express.json())

app.get("/", (_req, res)=> {
    res.json({message: "Hello World!"})
})

app.use("/api/users", UserRouter)
app.use("/api/quiz", QuizRouter)
app.use("/api/agent", AgentRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})