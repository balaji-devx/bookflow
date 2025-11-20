import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// --- SIGNUP ROUTE ---
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already registered",
      });
    }

    // --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Compare password with hashed one
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.json({
        success: false,
        message: "Incorrect password",
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Login failed",
    });
  }
});


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.json({
      success: true,
      message: "Signup successful",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Signup failed",
    });
  }
});

export default router;
