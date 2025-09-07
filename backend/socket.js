import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from './models/Message.js';
import Team from './models/Team.js';
import mongoose from 'mongoose';
import User from './models/users.js';
import AllMessages from './models/AllMessages.js';
export const initSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: 'http://localhost:3000', credentials: true },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Token missing from handshake'));
        }

        token = authHeader.split(' ')[1]
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            console.error('JWT verification failed:', err.message);
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        socket.on('joinTeamRoom', async (teamId) => {
            if (!mongoose.Types.ObjectId.isValid(teamId)) {
                return res.status(400).json({ message: 'Invalid team ID' });
            }
            const team = await Team.findById(teamId);
            if (!team || !team.members.includes(socket.user.id)) {
                return;
            }
            socket.join(teamId);

            const previousMessages = await Message.find({ team: teamId })
                .sort({ createdAt: 1 })
                .populate('sender', 'name');
            socket.emit('loadPreviousMessages', previousMessages);
        });

        socket.on('sendMessage', async ({ teamId, message }) => {
            const userId = socket.user.id;
            const senderUser = await User.findById(userId);

            const newMessage = await Message.create({
                team: teamId,
                sender: userId,
                text: message,
            });

            const populatedMessage = {
                text: newMessage.text,
                sender: { name: senderUser.name },
                createdAt: newMessage.createdAt,
            };

            socket.to(teamId).emit('newMessage', populatedMessage);
        });

        socket.on('joinAllChat', async () => {
            socket.join("all");

            const previousMessages = await AllMessages.find()
                .sort({ createdAt: 1 })
                .populate('sender', 'name')
            socket.emit('loadPreviousMessages', previousMessages);
        })

        socket.on('sendAllMessage', async ({ message }) => {
            const newMessage = await AllMessages.create({
                sender: socket.user.id,
                text: message,
            });
            const populatedMessage = await newMessage.populate('sender', 'name');
            socket.to("all").emit('newAllMessage', populatedMessage);

        })
    });
};