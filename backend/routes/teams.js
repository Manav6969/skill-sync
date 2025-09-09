import express from 'express';
const router = express.Router();
import Competition from '../models/Competition.js';
import { dashboardMiddleware } from '../middleware/getUser.js';
import Team from '../models/Team.js'; 

router.post('/create', dashboardMiddleware, async (req, res) => {
    let { competitionName, teamName, teamDescription } = req.body;
    try {
        if (!competitionName || !teamName) {
            return res.status(400).json({ message: 'Competition name and team name are required' });
        }

        let foundCompetiton = await Competition.findOne({ name: competitionName })
        if (!foundCompetiton) {
            foundCompetiton = await Competition.create({ name: competitionName });
        }
        let teamFound = await Team.findOne({name: teamName})
        if(teamFound)
        {
          return  res.status(400).json({message : 'Team Already exist'})
        }
        let team = await Team.create({
            name: teamName,
            description: teamDescription,
            competition: foundCompetiton._id,
            createdBy: req.user._id,
            members: [req.user._id]
        })
        foundCompetiton.team.push(team._id);
        await foundCompetiton.save();
        return res.status(201).json({
            message: 'Team created successfully',
            team: {
                id: team._id,
                name: team.name,
                description: team.description,
                competition: foundCompetiton.name,
                createdBy: req.user.name
            }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
})

router.get('/all', async (req, res) => {
    try {
        const competitions = await Competition.find().populate({
            path: 'team',
            model: 'Team',
            populate: [
                {
                    path: 'members',
                    model: 'User',
                    select: 'name email _id',
                },
                {
                    path: 'createdBy',
                    model: 'User',
                    select: 'name _id',
                },
            ],
        });

        return res.status(200).json(competitions);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});


export default router;

