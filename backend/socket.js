
import jwt from 'jsonwebtoken';
import Message from './models/Message.js';
import Team from './models/Team.js';
import mongoose from 'mongoose';
import User from './models/users.js';
import AllMessages from './models/AllMessages.js';
import { WebSocketServer } from 'ws';
import RoomConnectionManager from './utils/RoomConnectionManager.js';

export const initSocket = (server) => {
    
    const wss = new WebSocketServer({ server });
const roomManager = new RoomConnectionManager();

// Heartbeat Logic
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => clearInterval(interval));

       wss.on('connection', (ws) => {
    ws.isAlive = true;
    let isAuth = false;

    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (buffer) => {
        const { type, payload } = JSON.parse(buffer.toString());

        // 1. Auth Routing
        if (type === 'auth') {
            try {
                let token = payload.token.startsWith("Bearer ") ? payload.token.split(" ")[1] : payload.token;
                ws.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                isAuth = true;
                ws.send(JSON.stringify({ type: 'authSuccess' }));
            } catch (err) { ws.close(4001, 'Auth failed'); }
            return;
        }

        if (!isAuth) return;

        // 2. Event Routing
        switch (type) {
            case 'joinTeamRoom':
                roomManager.joinRoom(payload, ws);
                // Add your database queries here, then ws.send() the loadPreviousMessages payload
                break;
            case 'sendMessage':
                const { teamId, message } = payload;
                // Add your DB save query here, construct populatedMessage, then:
                roomManager.broadcastToRoom(teamId, 'newMessage', populatedMessage, ws);
                ws.send(JSON.stringify({ type: 'newMessage', payload: populatedMessage }));
                break;
            // ... map the rest of your cases (joinAllChat, sendAllMessage) similarly
        }
    });
});
    
};