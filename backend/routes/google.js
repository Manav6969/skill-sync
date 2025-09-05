import express from 'express';
import passport from 'passport';
const router = express.Router();
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const user = req.user;

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`http://localhost:3000/oauth-success?accessToken=${accessToken}`);
    } catch (error) {
      console.error('Google login error:', error);
      res.redirect('/login');
    }
  }
);

export default router;
