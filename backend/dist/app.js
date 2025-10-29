"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const quiz_route_1 = __importDefault(require("./routes/quiz.route"));
const agent_route_1 = __importDefault(require("./routes/agent.route"));
const cors_1 = __importDefault(require("cors"));
const dashboard_route_1 = __importDefault(require("./routes/dashboard.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
// Allow the local frontend during development. Use an env var in production for security.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173' || 'https://localhost:5173';
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));
// HTTP request logger
const isProd = process.env.NODE_ENV === 'production';
app.use((0, morgan_1.default)(isProd ? 'combined' : 'dev'));
app.use(express_1.default.json());
// Parse cookies so `cookieAuth` middleware can read `req.cookies.access_token`
app.use((0, cookie_parser_1.default)());
app.get("/", (_req, res) => {
    res.json({ message: "Hello World!" });
});
app.use("/api/users", user_route_1.default);
app.use("/api/quiz", quiz_route_1.default);
app.use("/api/agent", agent_route_1.default);
app.use("/api/dashboard", dashboard_route_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
