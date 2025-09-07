import express from 'express';
const router = express.Router();
import { connectDB } from '../config/db.js';
import jwt from 'jsonwebtoken';
import user from '../models/users.js';
await connectDB();
import cookieParser from "cookie-parser";
router.use(cookieParser());


export const dashboardMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.sendStatus(403);
       const userData = await user.findById(decoded.id).select('-password');
        req.user = userData;
        next();
    });
}

