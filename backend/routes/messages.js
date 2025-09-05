import express from 'express';
import Message from '../models/Message.js';
import Team from '../models/Team.js';
import { dashboardMiddleware } from '../middleware/getUser.js';

const router = express.Router();

router.get('/:teamId', dashboardMiddleware, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team || !team.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'Forbidden: Not a team member' });
        }
        const messages = await Message.find({ team: req.params.teamId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name');
        res.status(200).json(messages);
    } catch {
        res.status(500).json({ message: 'Error loading messages' });
    }
});

export default router;
