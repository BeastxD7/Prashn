import express from 'express'
import UserRouter from './routes/user.router'

const app = express()

app.use(express.json())

app.get("/", (req, res)=> {
    res.json({message: "Hello World!"})
})

app.use("/api/users", UserRouter)

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})