import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { requireAuth, issueToken, clearToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = issueToken(res, { id: user._id.toString(), email: user.email });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = issueToken(res, { id: user._id.toString(), email: user.email });
    res.json({ id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  clearToken(res);
  res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('_id name email');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

export default router;
