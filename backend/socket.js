import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from './models/Message.js';
import Team from './models/Team.js';
import mongoose from 'mongoose';
import User from './models/users.js';
import AllMessages from './models/AllMessages.js';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const createRedisClients = async () => {
    const pubClient = new Redis(REDIS_URL);
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) => console.error('Redis pub client error:', err));
    subClient.on('error', (err) => console.error('Redis sub client error:', err));

    return { pubClient, subClient };
};

export const initSocket = async (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:3000',
                'http://localhost:3001',
                'https://skill-sync-uobs.vercel.app',
                'https://skill-sync-uobs-p6j57qkld-manav6969s-projects.vercel.app',
                'https://skill-sync-kappa.vercel.app',
            ],
            credentials: true,
        },
    });

    const { pubClient, subClient } = await createRedisClients();
    io.adapter(createAdapter(pubClient, subClient));

    await subClient.subscribe('teamMessage');
    await subClient.subscribe('allMessage');

    subClient.on('message', (channel, payload) => {
        if (!payload) {
            return;
        }

        try {
            const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;

            if (channel === 'teamMessage') {
                const { teamId, message } = parsed || {};
                if (teamId && message) {
                    io.to(teamId).emit('newMessage', message);
                }
            } else if (channel === 'allMessage') {
                const { message } = parsed || {};
                if (message) {
                    io.to('all').emit('newAllMessage', message);
                }
            }
        } catch (err) {
            console.error(`Failed to parse ${channel} payload:`, err, 'payload:', payload);
        }
    });

    const publishTeamMessage = async (teamId, message) => {
        await pubClient.publish('teamMessage', JSON.stringify({ teamId, message }));
    };

    const publishAllMessage = async (message) => {
        await pubClient.publish('allMessage', JSON.stringify({ message }));
    };

    io.use((socket, next) => {
        let token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Token missing from handshake'));
        }
        if (token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        }

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
                return;
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
                sender: { name: senderUser?.name || 'Unknown' },
                createdAt: newMessage.createdAt,
            };

            await publishTeamMessage(teamId, populatedMessage);
        });

        socket.on('joinAllChat', async () => {
            socket.join('all');

            const previousMessages = await AllMessages.find()
                .sort({ createdAt: 1 })
                .populate('sender', 'name');
            socket.emit('loadPreviousMessages', previousMessages);
        });

        socket.on('sendAllMessage', async ({ message }) => {
            const newMessage = await AllMessages.create({
                sender: socket.user.id,
                text: message,
            });
            const populatedMessage = await newMessage.populate('sender', 'name');
            await publishAllMessage(populatedMessage);
        });
    });
};