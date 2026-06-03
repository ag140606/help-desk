//Import frameworks
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {
  Ticket,
  validateTicket,
  buildTicketDocument,
} = require('./data/schema');
const { User } = require('./data/userSchema');
const { authenticateToken } = require('./middleware/auth');
const { authorizeTicketOwner } = require('./middleware/ticketAuthorization');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/help-desk')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('Missing ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET in environment');
}
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function createAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

app.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).json({
      message: 'User created successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to sign up user' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to login' });
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
});

app.post('/auth/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Unable to logout' });
  }
});

app.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const all = await Ticket.find({ user_email: req.user.email });
    res.json(all);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.get('/tickets/:id', authenticateToken, authorizeTicketOwner, async (req, res) => {
  try {
    res.json(req.ticket);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/tickets', authenticateToken, async (req, res) => {
  try {
    const payload = { ...req.body, user_email: req.user.email };
    const validation = validateTicket(payload);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const newTicket = buildTicketDocument(payload);
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.delete('/tickets/:id', authenticateToken, authorizeTicketOwner, async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.ticket._id);
    res.status(200).json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));
