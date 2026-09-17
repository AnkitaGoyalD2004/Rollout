import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'rollout_production_secure_jwt_secret_token_key_2026';
  return jwt.sign(
    {
      userId: user._id,
      company: user.company,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: '7d' }
  );
};

// 1. REGISTER NEW USER & COMPANY WORKSPACE
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password || !company) {
      return res.status(400).json({ error: 'Please provide name, email, password, and company name.' });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedCompany = company.trim();

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword,
      company: trimmedCompany,
      role: 'admin',
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. LOGIN TO COMPANY WORKSPACE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. GET CURRENT LOGGED IN USER PROFILE
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      company: req.user.company,
      role: req.user.role,
    },
  });
});

export default router;
