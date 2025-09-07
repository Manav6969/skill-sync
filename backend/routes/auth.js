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
      let refreshToken = (`Bearer ${generateRefreshToken(userData._id)}`);

      console.log(refreshToken);

      res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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
        avatar: profilepic || "https://imgs.search.brave.com/pkPyTQFTOVFQw7Hki6hg6cgY5FPZ3UzkpUMsnfiuznQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvNTAwcC80/MS85MC9hdmF0YXIt/ZGVmYXVsdC11c2Vy/LXByb2ZpbGUtaWNv/bi1zaW1wbGUtZmxh/dC12ZWN0b3ItNTcy/MzQxOTAuanBn",
      });
      await newUser.save();

      const accessToken = generateAccessToken(newUser._id);
      const refreshToken = (`Bearer ${generateRefreshToken(userData._id)}`);

      res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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
    let token = (req.cookies.refreshToken);
    console.log(token)
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
    console.log(token)

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
  let token = (req.cookies.refreshToken);
  if (token.startsWith("Bearer ")) token = token.slice(7);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken(decoded.id);
    res.status(200).json({ accessToken });
  });
});


export default router;
