import express from 'express';
import Message from '../models/Message.js';
import Team from '../models/Team.js';
import { dashboardMiddleware } from '../middleware/getUser.js';

import { decodeCursor, encodeCursor } from '../utils/cursor.js';

const router = express.Router();

router.get('/:teamId', dashboardMiddleware, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team || !team.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'Forbidden: Not a team member' });
        }

        const limit = parseInt(req.query.limit) || 20;
        const cursor = req.query.cursor;

        const query = { team: req.params.teamId };

        if (cursor) {
            const decoded = decodeCursor(cursor);
            if (decoded) {
                const { timestamp, id } = decoded;
                // Cursor-based pagination logic:
                // Find messages where createdAt < timestamp 
                // OR (createdAt == timestamp AND _id < id)
                query.$or = [
                    { createdAt: { $lt: timestamp } },
                    { createdAt: timestamp, _id: { $lt: id } }
                ];
            }
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit)
            .populate('sender', 'name');

        // Reverse to return in chronological order for the frontend
        const chronMessages = [...messages].reverse();

        const nextCursor = messages.length === limit
            ? encodeCursor(messages[messages.length - 1].createdAt, messages[messages.length - 1]._id)
            : null;

        res.status(200).json({
            messages: chronMessages,
            nextCursor,
            hasMore: !!nextCursor
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        res.status(500).json({ message: 'Error loading messages' });
    }
});

export default router;
