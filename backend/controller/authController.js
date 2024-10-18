const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const crypto = require('crypto');
require('dotenv').config();

// Configure nodemailer for sending OTPs
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Helper function to generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Register a new user and send OTP for verification
exports.registerUser = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const otp = generateOTP();

      user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        otp,  // Store OTP for email verification
        otpExpires: Date.now() + 3600000, // OTP expires in 1 hour
      });

      await user.save();

      // Send OTP email
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Email Verification - OTP',
        html: `<p>Your OTP for email verification is: <b>${otp}</b>. It is valid for 1 hour.</p>`,
      };
      await transporter.sendMail(mailOptions);

      res.status(201).json({ msg: 'Registration successful, please verify your email using the OTP sent.' });
    } catch (error) {
      console.error('Registration Error:', error.message);
      res.status(500).send('Server error');
    }
  },
];

// Verify user email with OTP
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: 'User already verified' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ msg: 'Email verified successfully' });
  } catch (error) {
    console.error('Email Verification Error:', error.message);
    res.status(500).send('Server error');
  }
};

// Login user
exports.loginUser = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Check if email is verified
      if (!user.isVerified) {
        return res.status(400).json({ msg: 'Please verify your email to log in' });
      }

      // Create and send the JWT token
      const payload = { user: { userId: user._id } };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) {
            console.error('JWT Signing Error:', err.message);
            return res.status(500).send('Server error');
          }
          res.json({ token });
        }
      );
    } catch (error) {
      console.error('Login Error:', error.message);
      res.status(500).send('Server error');
    }
  },
];

// Forgot password - send OTP
exports.forgotPassword = [
  check('email', 'Please include a valid email').isEmail(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ msg: 'User does not exist' });
      }

      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = Date.now() + 3600000; // 1 hour expiration
      await user.save();

      // Send OTP email
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Password Reset - OTP',
        html: `<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 1 hour.</p>`,
      };
      await transporter.sendMail(mailOptions);

      res.status(200).json({ msg: 'Password reset OTP sent' });
    } catch (error) {
      res.status(500).send('Server error');
    }
  },
];

// Reset password with OTP
exports.resetPassword = [
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, password } = req.body;
    try {
      const user = await User.findOne({
        email: email.toLowerCase(),
        otp: otp,
        otpExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid OTP or expired' });
      }

      // Hash new password before saving
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      res.status(200).json({ msg: 'Password successfully reset' });
    } catch (error) {
      res.status(500).send('Server error');
    }
  },
];

// Update user profile
exports.updateUserProfile = [
  check('name', 'Name is required').optional().not().isEmpty(),
  check('bio', 'Bio must not exceed 200 characters').optional().isLength({ max: 200 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, bio, profilePic } = req.body;
    try {
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      user.name = name || user.name;
      user.bio = bio || user.bio;
      user.profilePic = profilePic || user.profilePic;

      await user.save();

      res.json({ user, msg: 'Profile updated successfully' });
    } catch (error) {
      res.status(500).send('Server error');
    }
  },
];

// Get user profile
// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Ensure that the user ID is available from the token
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ msg: 'Unauthorized access, invalid token' });
    }

    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get User Profile Error:', error.message);
    res.status(500).send('Server error');
  }
};
