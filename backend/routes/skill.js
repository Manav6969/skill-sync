import express from 'express';
const router = express.Router();
import user from '../models/users.js';

router.get('/', async (req, res) => {
  const userData = await user.find({}, 'name skills projectlinks').lean();
    if (!userData) {
        return res.status(404).json({ message: 'No users found' });
    }

    const skillsData = userData.map(u => ({
        name: u.name,
        skills: u.skills,
        projectlinks: u.projectlinks || [] 
    }));
   return res.status(200).json(skillsData);
})

export default router;