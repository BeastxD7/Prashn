"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const quiz_route_1 = __importDefault(require("./routes/quiz.route"));
const agent_route_1 = __importDefault(require("./routes/agent.route"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.json({ message: "Hello World!" });
});
app.use("/api/users", user_route_1.default);
app.use("/api/quiz", quiz_route_1.default);
app.use("/api/agent", agent_route_1.default);
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
