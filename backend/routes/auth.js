require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/User"); 
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwt.js");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// ✅ Use environment variables for security
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Function to generate OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// ✅ Function to send OTP
async function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
  }
}

// ✅ In-memory store for OTPs
const otpStore = new Map();

function storeOTP(email, otp) {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, expiresAt });
}

function verifyOTP(email, enteredOtp) {
  const record = otpStore.get(email);
  if (!record) return { success: false, message: "No OTP found for this email." };

  const { otp, expiresAt } = record;
  if (Date.now() > expiresAt) {
    otpStore.delete(email);
    return { success: false, message: "OTP has expired." };
  }
  if (otp !== enteredOtp) return { success: false, message: "Invalid OTP." };

  otpStore.delete(email);
  return { success: true, message: "OTP verified successfully." };
}

// ✅ Endpoint to request OTP
router.post("/signup/request-otp", async (req, res) => {
  const { email } = req.body;
  console.log("📩 Requesting OTP for:", email);

  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = generateOTP();
  await sendOTP(email, otp);
  storeOTP(email, otp);
  res.status(200).json({ message: "OTP sent to your email." });
});

// ✅ Endpoint to verify OTP
router.post("/signup/verify-otp", (req, res) => {
  const { email, user_otp } = req.body;
  console.log("🔍 Verifying OTP for:", email);

  const verificationResult = verifyOTP(email, user_otp);
  if (verificationResult.success) {
    res.status(200).json({ message: "OTP verified successfully." });
  } else {
    res.status(400).json({ message: verificationResult.message });
  }
});

// ✅ Signup route
router.post("/signup", async (req, res) => {
  try {
    const { username, password, email, mobile } = req.body;
    console.log("👤 New signup request:", { username, email, mobile });

    if (!username || !password || !email || !mobile) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const findUser = await User.findOne({ email });
    console.log("🔍 Checking existing user:", findUser);

    if (findUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email, mobile });

    console.log("💾 Saving new user:", newUser);
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔑 Login request:", email);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = generateToken(user);
    res.status(200).json({ message: "Logged in successfully", token });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Reset Password route
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔄 Password reset request for:", email);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    const token = generateToken(user);
    res.status(200).json({ message: "Password reset successfully", token });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
