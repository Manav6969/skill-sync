import dotenv from 'dotenv';
dotenv.config(); 
import { connectDB } from './config/db.js';
connectDB();
import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import teamRoutes from './routes/teams.js';
import inviteRoutes from './routes/invite.js';
import skillRoutes from './routes/skill.js';
import messageRoutes from './routes/messages.js';
import googleRoutes from './routes/google.js';
// import resourceRoutes from './routes/resources.js';


import { initSocket } from './socket.js';

const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(cookieParser());

app.use(cors({
  origin: [
  "http://localhost:3000",   
  "https://skill-sync-zn0l.onrender.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/messages', messageRoutes);
app.use('/auth', googleRoutes);
// app.use('/api/resources', resourceRoutes);


app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

