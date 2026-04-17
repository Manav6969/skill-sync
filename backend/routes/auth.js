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

      let accessToken = generateAccessToken(userData._id);
      let refreshToken = (`Bearer ${generateRefreshToken(userData._id)}`);
       userData.refreshTokens.push(refreshToken);
       await userData.save();

      console.log(refreshToken);
   

      res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          path: "/",
          // domain: '.vercel.app',
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
      const refreshToken = (`Bearer ${generateRefreshToken(newUser._id)}`);

      res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          path: '/',
          // domain: '.vercel.app',
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

router.post('/logout', async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.sendStatus(204);

    const refreshTokenToClear = cookies.refreshToken;

  
    const foundUser = await user.findOne({ refreshTokens: refreshTokenToClear }).exec();
    
    if (!foundUser) {
        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

   
    foundUser.refreshTokens = foundUser.refreshTokens.filter(rt => rt !== refreshTokenToClear);
    await foundUser.save();

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });
    return res.status(200).json({ message: 'Logged out successfully across server and client.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Logout failed' });
  }
});
// ============================================================
// REFRESH TOKEN ROTATION & REUSE DETECTION (THE TRAP)
// ============================================================
router.get('/refresh', async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.sendStatus(401);

    const oldToken = cookies.refreshToken;
    
    // 1. Immediately clear the cookie so it can't be used again
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });

    // 2. Find the user holding this specific token
    const foundUser = await user.findOne({ refreshTokens: oldToken }).exec();

    // 🚨 DETECT REUSE (THE TRAP) 🚨
    if (!foundUser) {
      // The token is NOT in our database. It might be stolen!
      // Strip "Bearer " and verify if it's even a real token
      const tokenStr = oldToken.startsWith("Bearer ") ? oldToken.slice(7) : oldToken;
      
      jwt.verify(tokenStr, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return; // Just an expired token, ignore.
        
        // IT IS A VALID TOKEN BUT NOT IN OUR DB! 
        // Someone is trying to reuse an old token. Hack detected.
        const hackedUser = await user.findById(decoded.id).exec();
        if (hackedUser) {
          hackedUser.refreshTokens = []; // Nuke all sessions!
          await hackedUser.save();
          console.log(`🚨 SECURITY ALERT: Token reuse detected for ${hackedUser.email}. All sessions revoked.`);
        }
      });
      return res.status(403).json({ message: "Security breach detected. All sessions terminated." });
    }

    // 3. NORMAL FLOW: Remove the used token from the list
    const updatedList = foundUser.refreshTokens.filter(rt => rt !== oldToken);

    const tokenStr = oldToken.startsWith("Bearer ") ? oldToken.slice(7) : oldToken;
    
    jwt.verify(tokenStr, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err || foundUser._id.toString() !== decoded.id) {
        foundUser.refreshTokens = [...updatedList];
        await foundUser.save();
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      // 🔄 ROTATE: Generate brand new tokens
      const accessToken = generateAccessToken(foundUser._id);
      const newRefreshToken = `Bearer ${generateRefreshToken(foundUser._id)}`;

      // 4. Save the NEW token to the list
      foundUser.refreshTokens = [...updatedList, newRefreshToken];
      await foundUser.save();

      // 5. Send the new cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
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
  let token = req.cookies?.refreshToken;
  if (!token) return res.sendStatus(401);
  if (token.startsWith("Bearer ")) token = token.slice(7);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken(decoded.id);
    res.status(200).json({ accessToken });
  });
});


export default router;
