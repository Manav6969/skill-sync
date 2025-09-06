import express from 'express';
const router = express.Router();
import user from '../models/users.js';
import { connectDB } from '../config/db.js';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dashboardMiddleware } from '../middleware/getUser.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

await connectDB();

router.post('/login', async (req, res) => {
  try {
    const userData = await user.findOne({ email: req.body.email });
    if (!userData)
      return res.status(401).json({ redirectTo: "/signup" });

    if (userData.password === null) {
      return res.status(400).json({ message: "Please login with Google", redirectTo: "/login" });
    }
    const isMatch = await bcrypt.compare(req.body.password, userData.password);
    if (!isMatch) {
      console.log("Invalid credentials");
      return res.status(400).json({ message: "Invalid Credentials", redirectTo: "/login" });
    } else {

      const accessToken = generateAccessToken(userData._id);
      const refreshToken = generateRefreshToken(userData._id);

      res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'None',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })

      userData.refreshToken = refreshToken;
      await userData.save();

      res.status(200).json({ message: 'Login successful', accessToken });
    }

  } catch (err) {
    console.log(err.message);
  }

});

router.post('/signup', async (req, res) => {
  try {
    let { name, email, password, profilepic } = req.body;

    let userData = await user.findOne({ email: email });
    if (userData)
      return res.status(400).json({ redirectTo: "/login" });
    if (!userData) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new user({
        name,
        email,
        password: hashedPassword,
        avatar: profilepic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      });
      await newUser.save();

      const accessToken = generateAccessToken(newUser._id);
      const refreshToken = generateRefreshToken(newUser._id);

      res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'None',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })

      newUser.refreshToken = refreshToken;
      await newUser.save();
      res.status(201).json({ message: "Signup successful", accessToken, redirectTo: "/dashboard" });
    }
  }
  catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }

});

router.post('/logout', (req, res) => {
  try {
    res.clearCookie('refreshToken', {
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Logout failed' });
  }
});


router.get('/userAuthentication', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    console.log(token)
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      res.status(200).json({ message: "Authorized", userId: decoded.id });
    });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get('/getUser', dashboardMiddleware, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post('/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken(decoded.id);
    res.status(200).json({ accessToken });
  });
});


export default router;
