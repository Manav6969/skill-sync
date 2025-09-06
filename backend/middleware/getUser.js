import express from 'express';
const router = express.Router();
import { connectDB } from '../config/db.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import user from '../models/users.js';
await connectDB();

export const dashboardMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split('%20')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.sendStatus(403);
       const userData = await user.findById(decoded.id).select('-password');
        req.user = userData;
        next();
    });
}

