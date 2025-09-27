"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.converse = void 0;
const model_1 = require("../ai_agent/model");
const converse = async (req, res) => {
    try {
        const { text } = req.body;
        if (text) {
            const response = await (0, model_1.callLLM)(text);
            res.status(200).json({ response });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.converse = converse;
