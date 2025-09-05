import express from 'express';
const router = express.Router();
import Competition from '../models/Competition.js';
import { dashboardMiddleware } from '../middleware/getUser.js';
import Team from '../models/Team.js';
import user from '../models/users.js';
import Invitation from '../models/invitation.js';

router.post('/send', dashboardMiddleware, async (req, res) => {
    const { email, teamId } = req.body;
    try {
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        const toUser = await user.findOne({ email });
        if (!toUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (team.members.includes(toUser._id)) {
            return res.status(400).json({ message: 'Already a member of this team' });
        }
        const invitation = await Invitation.create({
            toUser: toUser._id,
            fromUser: req.user._id,
            team: teamId,
            status: 'pending'
        });
        res.status(201).json({ message: 'Invitation sent successfully', invitation });
    } catch (error) {
        console.error('Error sending invitation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/yourInvites', dashboardMiddleware, async (req, res) => {
    try {
        const invitations = await Invitation.find({ toUser: req.user._id, status: "pending" }).populate('fromUser team');
        res.status(200).json(invitations);
    } catch (error) {
        console.error('Error fetching invitations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/accept/:id', dashboardMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const invitation = await Invitation.findById(id);
        if (!invitation) {  
            return res.status(404).json({ message: 'Invite not found' });
        }
        if (invitation.toUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to accept this invitation' });
        }
        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Invite not pending' });
        }
        const team = await Team.findById(invitation.team);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        if (team.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'You are already a member of this team' });
        }
        team.members.push(req.user._id);
        await team.save();
        invitation.status = 'accepted';
        await invitation.save();
        res.status(200).json({ message: 'Invitation accepted successfully', team });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/reject/:id', dashboardMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const invitation = await Invitation.findById(id);
        if (!invitation) {  
            return res.status(404).json({ message: 'Invitation not found' });
        } 
        if (invitation.toUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to reject this invitation' });
        }
        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation is not pending' });
        }
        invitation.status = 'rejected';
        await invitation.save();
        res.status(200).json({ message: 'Invitation rejected successfully' });
    } catch (error) {
        console.error('Error rejecting invitation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
