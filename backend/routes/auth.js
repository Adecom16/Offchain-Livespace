const express = require('express');
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  verifyEmail // Added verifyOTP function
} = require('../controller/authController'); // Ensure correct path
const authMiddleware = require('../middlewares/authMiddleware'); // Ensure correct path

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Email verification - OTP
router.post('/verify-email', verifyEmail); // Changed to POST for OTP submission

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

// Get current user profile (protected route)
router.get('/profile', authMiddleware, getUserProfile);

// Update user profile (protected route)
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;
