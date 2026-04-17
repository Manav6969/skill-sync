import express from 'express';
const router = express.Router();
import { connectDB } from '../config/db.js';
import jwt from 'jsonwebtoken';
import user from '../models/users.js';
await connectDB();
import cookieParser from "cookie-parser";
router.use(cookieParser());

export const dashboardMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.sendStatus(403);
        
        // Find the user in the database
        const userData = await user.findById(decoded.id).select('-password');
        
        if (!userData) return res.sendStatus(403);

        // 🚨 THE KILL-SWITCH: If the token list is empty, block them!
        if (!userData.refreshTokens || userData.refreshTokens.length === 0) {
            console.log(`🛡️ Kill-Switch: Blocked access for ${userData.email}`);
            return res.status(403).json({ message: "Session revoked. Please log in again." });
        }

        req.user = userData;
        next();
    });
}