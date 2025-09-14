const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generates a JWT token for a given user ID.
 * @param {string} id - The user ID.
 * @returns {string} The generated JWT token.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Handles user signup.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const signup = async (req, res) => {
  const { first_name, last_name, username, email, mobile_number, password } = req.body;

  try {
    let user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create({ first_name, last_name, username, email, mobile_number, password });
    const token = generateToken(user.id);

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email, mobile_number: user.mobile_number }, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Handles user signin.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const signin = async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' can be email or username

  try {
    let user = await User.findByEmail(identifier);

    if (!user) {
      user = await User.findByUsername(identifier);
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.status(200).json({ message: 'Logged in successfully', user: { id: user.id, first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email, mobile_number: user.mobile_number }, token });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  signup,
  signin,
  generateToken,
};