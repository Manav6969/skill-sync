import express from 'express';
const router = express.Router();
import user from '../models/users.js';
import { dashboardMiddleware } from '../middleware/getUser.js';

router.put('/updateSkills', dashboardMiddleware, async (req, res) => {
    try {
        const { skills } = req.body;
        const userId = req.user._id;
    
        if (!skills || !Array.isArray(skills)) {
        return res.status(400).json({ message: 'Invalid format' });
        }
    
        await user.findByIdAndUpdate(userId, { skills }, { new: true });
    
        res.status(200).json({ message: 'Skills updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

router.put('/updateProjects', dashboardMiddleware, async (req, res) => {
    try
    {
        let { projectlinks } = req.body;
        let updatedUser = await user.findByIdAndUpdate({_id: req.user._id}, {projectlinks}, {new: true});
        return res.status(200).json({
            message: 'Projects updated successfully',
            user: {
                name: updatedUser.name,
                projectlinks: updatedUser.projectlinks
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

export default router;